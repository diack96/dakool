import { useState, useCallback } from 'react';

interface UseRateLimitOptions {
  maxAttempts: number;
  timeWindow: number; // en millisecondes
}

export function useRateLimit ({ maxAttempts, timeWindow }: UseRateLimitOptions) {
  const [attempts, setAttempts] = useState<number[]>([]);

  const canAttempt = useCallback(() => {
    const now = Date.now();
    const validAttempts = attempts.filter(timestamp => now - timestamp < timeWindow);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    return true;
  }, [attempts, maxAttempts, timeWindow]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setAttempts(prev => [...prev, now]);
  }, []);

  const getRemainingTime = useCallback(() => {
    if (attempts.length === 0) return 0;

    const now = Date.now();
    const oldestAttempt = Math.min(...attempts);
    const timeUntilReset = timeWindow - (now - oldestAttempt);

    return Math.max(0, timeUntilReset);
  }, [attempts, timeWindow]);

  const reset = useCallback(() => {
    setAttempts([]);
  }, []);

  return {
    canAttempt,
    recordAttempt,
    getRemainingTime,
    reset,
    attemptsCount: attempts.length,
  };
}
