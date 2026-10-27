import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Batch, NewBatchInput } from '../types';
import { createBatch, fetchBatches } from '../services/api';
import { useAuth } from './AuthContext';

interface BatchContextValue {
  batches: Batch[];
  loading: boolean;
  error: string | null;
  /** Looks up a single batch from the already-loaded list — no extra request needed. */
  getBatch: (id: string) => Batch | undefined;
  /** Submits a new batch to the backend and merges the assessed result into state. */
  addBatch: (input: NewBatchInput) => Promise<Batch>;
  /** Re-fetches the batch list and saved assessments from the backend. */
  refresh: () => Promise<void>;
}

const BatchContext = createContext<BatchContextValue | null>(null);

export function BatchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [batches, setBatches] = useState<Batch[]>([]);
  // Starts false (not true) because there's nothing to load until a user is
  // authenticated — AppShell only ever mounts BatchProvider's consumers once
  // `user` is set, but this guards against any future direct usage too.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBatches();
      setBatches(data);
    } catch {
      setError('Could not load batches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Batch endpoints are now auth-protected — only fetch once we have a
  // logged-in user, and clear out any previous user's batches on logout.
  // Profile edits replace the user object without changing the account. They
  // must not reload batches and overwrite the assessments already in memory.
  useEffect(() => {
    if (userId !== undefined) {
      load();
    } else {
      setBatches([]);
    }
  }, [userId, load]);

  const getBatch = useCallback((id: string) => batches.find(b => b.id === id), [batches]);

  const addBatch = useCallback(async (input: NewBatchInput) => {
    const created = await createBatch(input);
    setBatches(prev => [created, ...prev]);
    return created;
  }, []);

  const value = useMemo<BatchContextValue>(
    () => ({ batches, loading, error, getBatch, addBatch, refresh: load }),
    [batches, loading, error, getBatch, addBatch, load],
  );

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
}

export function useBatches() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatches must be used within a BatchProvider');
  return ctx;
}
