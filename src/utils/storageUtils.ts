/**
 * Utility functions for localStorage read/write with error handling.
 * Provides a thin abstraction layer that handles JSON serialization,
 * parse errors, and graceful fallbacks when storage is unavailable.
 */

/**
 * Load a value from localStorage, parsing it as JSON.
 * Returns the fallback value if the key doesn't exist, the stored
 * value is malformed JSON, or localStorage is unavailable.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

/**
 * Save a value to localStorage as JSON.
 * Returns true on success, false if localStorage is unavailable,
 * the quota is exceeded, or any other error occurs.
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}
