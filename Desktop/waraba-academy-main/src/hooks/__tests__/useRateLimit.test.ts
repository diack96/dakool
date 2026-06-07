/**
 * Tests unitaires pour src/hooks/useRateLimit.ts
 */

import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '../useRateLimit';

describe('useRateLimit', () => {
  const OPTIONS = { maxAttempts: 3, timeWindow: 60_000 }; // 3 tentatives / 1 min

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // canAttempt
  // ──────────────────────────────────────────────────────────────────────────

  it('autorise la première tentative', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));
    expect(result.current.canAttempt()).toBe(true);
  });

  it('autorise jusqu\'à maxAttempts tentatives', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));

    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });

    expect(result.current.canAttempt()).toBe(true);
  });

  it('bloque après maxAttempts tentatives', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));

    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });

    expect(result.current.canAttempt()).toBe(false);
  });

  it('autorise à nouveau après que la fenêtre de temps expire', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));

    // Remplir les tentatives
    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });

    expect(result.current.canAttempt()).toBe(false);

    // Avancer le temps au-delà de la fenêtre
    act(() => { jest.advanceTimersByTime(61_000); });

    expect(result.current.canAttempt()).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // recordAttempt
  // ──────────────────────────────────────────────────────────────────────────

  it('incrémente attemptsCount après chaque recordAttempt', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));

    expect(result.current.attemptsCount).toBe(0);

    act(() => { result.current.recordAttempt(); });
    expect(result.current.attemptsCount).toBe(1);

    act(() => { result.current.recordAttempt(); });
    expect(result.current.attemptsCount).toBe(2);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getRemainingTime
  // ──────────────────────────────────────────────────────────────────────────

  it('retourne 0 si aucune tentative enregistrée', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));
    expect(result.current.getRemainingTime()).toBe(0);
  });

  it('retourne un temps positif après une tentative', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));
    act(() => { result.current.recordAttempt(); });
    expect(result.current.getRemainingTime()).toBeGreaterThan(0);
  });

  it('retourne 0 si la fenêtre de temps a expiré', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));
    act(() => { result.current.recordAttempt(); });
    act(() => { jest.advanceTimersByTime(61_000); });
    expect(result.current.getRemainingTime()).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // reset
  // ──────────────────────────────────────────────────────────────────────────

  it('reset réinitialise les tentatives et autorise de nouveau', () => {
    const { result } = renderHook(() => useRateLimit(OPTIONS));

    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });
    act(() => { result.current.recordAttempt(); });

    expect(result.current.canAttempt()).toBe(false);
    expect(result.current.attemptsCount).toBe(3);

    act(() => { result.current.reset(); });

    expect(result.current.canAttempt()).toBe(true);
    expect(result.current.attemptsCount).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // edge cases
  // ──────────────────────────────────────────────────────────────────────────

  it('fonctionne avec maxAttempts = 1', () => {
    const { result } = renderHook(() => useRateLimit({ maxAttempts: 1, timeWindow: 60_000 }));

    expect(result.current.canAttempt()).toBe(true);
    act(() => { result.current.recordAttempt(); });
    expect(result.current.canAttempt()).toBe(false);
  });

  it('gère une grande fenêtre de temps sans problème', () => {
    const { result } = renderHook(() => useRateLimit({ maxAttempts: 5, timeWindow: 24 * 60 * 60 * 1000 }));
    act(() => { result.current.recordAttempt(); });
    expect(result.current.getRemainingTime()).toBeGreaterThan(0);
  });
});
