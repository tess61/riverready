import { useCallback, useEffect, useRef, useState } from 'react';

// useApi(fn, deps): fn(signal) returns a promise. Fetches when deps change (not on every
// render), aborts the previous request, and exposes reload(). Pass fn = null to skip.
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: !!fn, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn; // always call the latest fn without making it a dependency
  const ctrl = useRef(null);

  const run = useCallback(() => {
    ctrl.current?.abort();
    if (!fnRef.current) { setState({ data: null, loading: false, error: null }); return; }
    const c = new AbortController();
    ctrl.current = c;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef.current(c.signal).then(
      (data) => { if (!c.signal.aborted) setState({ data, loading: false, error: null }); },
      (error) => { if (!c.signal.aborted && error.name !== 'AbortError') setState({ data: null, loading: false, error }); },
    );
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); return () => ctrl.current?.abort(); }, [...deps, !!fn]);

  return { ...state, reload: run };
}
