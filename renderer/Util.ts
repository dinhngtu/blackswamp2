import { Dispatch, useEffect, useState } from "preact/hooks";

export function getPageBaseName(pathname: string = window.location.pathname) {
  const path = pathname.replace(/\/+$/, '');
  const slash = path.lastIndexOf("/");
  const id = slash >= 0 ? path.substring(slash + 1) : null;
  return id?.replace(/\.html$/, '');
}

export function useLocalStorage(key: string): [string | null, Dispatch<string | null>] {
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
