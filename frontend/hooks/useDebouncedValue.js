"use client";

/**
 * hooks/useDebouncedValue.js
 * Returns a debounced copy of `value`, updated `delay`ms after it stops
 * changing. Used by the gig browse filter sidebar's text/budget inputs.
 */
import { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
