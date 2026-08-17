import { useEffect, useRef } from "react";

// Runs an effect but skips React StrictMode's duplicate invocation in dev.
// Keys on the dependency values, so it still re-runs whenever the deps change
// (e.g. page changes), just never twice for the same value.
export default function useOnceEffect(callback, deps = []) {
  const lastKeyRef = useRef(undefined);

  useEffect(() => {
    const key = JSON.stringify(deps);
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}