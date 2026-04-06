// src/hooks/useFirestore.js
// ─── Custom hooks for Firebase data fetching ──────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";

// ── Generic fetch hook ────────────────────────────────────────────────────────
export function useFirestore(fetchFn, deps = [], immediate = true) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      if (mountedRef.current) setError(err.message || "Something went wrong");
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) fetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetch };
}

// ── Upload hook with progress ─────────────────────────────────────────────────
export function useUpload() {
  const [progress,  setProgress]  = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);

  const upload = useCallback(async (uploadFn) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const result = await uploadFn((p) => setProgress(p));
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, progress, uploading, error };
}

