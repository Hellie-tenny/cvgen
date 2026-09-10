import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)

      // Basic validation - ensure the parsed data has the expected structure
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as T
      }

      console.warn(`Invalid data structure in localStorage for key "${key}", using initial value`)
      return initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    // Use React's own functional updater so `current` is always the true
    // latest state, even when multiple setValue calls happen in quick
    // succession (e.g. several async steps completing close together).
    // Reading a closed-over `storedValue` here instead would let one
    // update silently overwrite another based on a stale snapshot.
    setStoredValue((current) => {
      const valueToStore = value instanceof Function ? value(current) : value
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
      return valueToStore
    })
  }

  return [storedValue, setValue] as const
}