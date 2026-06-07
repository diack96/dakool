/**
 * Hook React pour utiliser le client API sécurisé
 * avec gestion d'erreurs et retry automatique
 */

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/secureApiClient';

interface UseSecureApiOptions {
  retries?: number;
  retryDelay?: number;
  onError?: (error: { message: string; code?: string; status?: number }) => void;
  onSuccess?: <T>(data: T) => void;
}

export function useSecureApi(options: UseSecureApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; status?: number } | null>(null);

  const get = useCallback(async <T = unknown>(
    url: string,
    clientOptions?: Parameters<typeof apiClient.get>[1]
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.get<T>(url, {
        ...options,
        ...clientOptions,
      });

      if (result.error) {
        setError(result.error);
        options.onError?.(result.error);
        return null;
      }

      if (result.data) {
        options.onSuccess?.(result.data);
        return result.data;
      }

      return null;
    } catch (err) {
      const apiError = {
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        code: 'UNKNOWN',
      };
      setError(apiError);
      options.onError?.(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const post = useCallback(async <T = unknown>(
    url: string,
    body?: unknown,
    clientOptions?: Parameters<typeof apiClient.post>[2]
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<T>(url, body, {
        ...options,
        ...clientOptions,
      });

      if (result.error) {
        setError(result.error);
        options.onError?.(result.error);
        return null;
      }

      if (result.data) {
        options.onSuccess?.(result.data);
        return result.data;
      }

      return null;
    } catch (err) {
      const apiError = {
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        code: 'UNKNOWN',
      };
      setError(apiError);
      options.onError?.(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    get,
    post,
    loading,
    error,
    clearError: () => setError(null),
  };
}
