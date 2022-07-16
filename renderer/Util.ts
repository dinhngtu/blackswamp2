import { StateUpdater, useEffect, useState } from "preact/hooks";

export function useLocalStorage(key: string): [string | null, StateUpdater<string | null>] {
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      return window.localStorage.getItem(key);
    } else {
      return null;
    }
  });
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined")
      return;
    if (value == null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  }, [value]);
  return [value, setValue];
}
