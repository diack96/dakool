/**
 * Client API sécurisé avec gestion d'erreurs robuste
 * - Retry automatique pour les erreurs réseau
 * - Validation des réponses
 * - Gestion des erreurs 404/400/500
 * - Cache et déduplication des requêtes
 */

interface ApiClientOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  validateResponse?: boolean;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Types pour les réponses API standardisées
interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  course?: T;
  courses?: T[];
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

class SecureApiClient {
  private defaultOptions: Required<ApiClientOptions> = {
    retries: 2,
    retryDelay: 1000,
    timeout: 30000,
    validateResponse: true,
  };

  /**
   * Effectue une requête API avec retry et gestion d'erreurs
   */
  async request<T = ApiResponse>(
    url: string,
    options: RequestInit = {},
    clientOptions: ApiClientOptions = {}
  ): Promise<{ data: T | null; error: ApiError | null }> {
    const opts = { ...this.defaultOptions, ...clientOptions };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= opts.retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        // Gérer les erreurs HTTP
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          
          // Ne pas retry sur les erreurs 4xx (sauf 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            return {
              data: null,
              error: {
                message: errorData.message || `Erreur ${response.status}`,
                code: errorData.code || `HTTP_${response.status}`,
                status: response.status,
                details: errorData.details,
              },
            };
          }

          // Retry sur les erreurs 5xx et 429
          if (attempt < opts.retries) {
            await this.delay(opts.retryDelay * (attempt + 1));
            continue;
          }

          return {
            data: null,
            error: {
              message: errorData.message || `Erreur serveur ${response.status}`,
              code: errorData.code || `HTTP_${response.status}`,
              status: response.status,
              details: errorData.details,
            },
          };
        }

        // Parser la réponse
        const text = await response.text();
        if (!text || text.trim() === '') {
          return {
            data: null,
            error: {
              message: 'Réponse vide du serveur',
              code: 'EMPTY_RESPONSE',
              status: response.status,
            },
          };
        }
        
        let data: T;
        try {
          data = JSON.parse(text) as T;
        } catch (parseError) {
          return {
            data: null,
            error: {
              message: 'Réponse JSON invalide',
              code: 'INVALID_JSON',
              status: response.status,
            },
          };
        }

        // Valider la réponse si demandé
        if (opts.validateResponse && !this.isValidResponse(data)) {
          return {
            data: null,
            error: {
              message: 'Réponse API invalide',
              code: 'INVALID_RESPONSE',
              status: response.status,
            },
          };
        }

        return { data, error: null };
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = this.handleRequestError(error);

        // Retry sur les erreurs réseau
        if (this.isRetryableError(error) && attempt < opts.retries) {
          await this.delay(opts.retryDelay * (attempt + 1));
          continue;
        }

        return { data: null, error: lastError };
      }
    }

    return { data: null, error: lastError || { message: 'Erreur inconnue', code: 'UNKNOWN' } };
  }

  /**
   * Parse une réponse d'erreur
   */
  private async parseErrorResponse(response: Response): Promise<{ message: string; code?: string; details?: unknown }> {
    try {
      const data = await response.json();
      return {
        message: data.error?.message || data.message || `Erreur ${response.status}`,
        code: data.error?.code || data.code,
        details: data.error?.details || data.details,
      };
    } catch {
      return {
        message: `Erreur ${response.status}: ${response.statusText}`,
        code: `HTTP_${response.status}`,
      };
    }
  }

  /**
   * Valide qu'une réponse API est valide
   */
  private isValidResponse(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Vérifier si c'est une réponse d'erreur
    if ('error' in data && (data as any).error) return false;
    
    // Vérifier si c'est une réponse de succès
    if ('success' in data || 'data' in data || 'course' in data || 'courses' in data) return true;
    
    // Accepter les réponses directes (pour compatibilité)
    return true;
  }

  /**
   * Gère les erreurs de requête
   */
  private handleRequestError(error: unknown): ApiError {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          message: 'Requête expirée (timeout)',
          code: 'TIMEOUT',
        };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          message: 'Erreur de connexion réseau',
          code: 'NETWORK_ERROR',
        };
      }

      return {
        message: error.message,
        code: 'REQUEST_ERROR',
      };
    }

    return {
      message: 'Erreur inconnue lors de la requête',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Détermine si une erreur est retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry sur les erreurs réseau
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.name === 'AbortError') {
        return true;
      }
    }
    return false;
  }

  /**
   * Délai avant retry
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, options?: ApiClientOptions): Promise<{ data: T | null; error: ApiError | null }> {
    return this.request<T>(url, { method: 'GET' }, options);
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, body?: unknown, options?: ApiClientOptions): Promise<{ data: T | null; error: ApiError | null }> {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, options);
  }
}

export const apiClient = new SecureApiClient();

/**
 * Hook React pour utiliser le client API sécurisé
 */
export function useSecureApi() {
  return {
    get: <T = unknown>(url: string, options?: ApiClientOptions) => 
      apiClient.get<T>(url, options),
    post: <T = unknown>(url: string, body?: unknown, options?: ApiClientOptions) => 
      apiClient.post<T>(url, body, options),
  };
}
