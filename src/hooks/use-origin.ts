"use client";

import { useSyncExternalStore } from "react";

// Подписка для SSR
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useOrigin() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return "";
  }

  return typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "";
}
