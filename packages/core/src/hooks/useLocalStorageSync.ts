import { useCallback, useEffect, useState } from 'react'
import { UseLocalStorageSyncOptions, UseLocalStorageSyncReturn } from './types'

export function useLocalStorageSync<T>(
    key: string,
    initialValue: T,
    options: UseLocalStorageSyncOptions = {}
): UseLocalStorageSyncReturn<T> {
    const { ttl, json = true } = options

    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = localStorage.getItem(key)
            if (!item) return initialValue

            const parsed = json ? JSON.parse(item) : (item as any as T)

            // Check TTL
            if (ttl && typeof parsed === 'object' && parsed !== null && 'timestamp' in parsed && 'ttl' in parsed) {
                const { timestamp, ttl: itemTtl, value: itemValue } = parsed as any
                if (Date.now() - timestamp > itemTtl) {
                    localStorage.removeItem(key)
                    return initialValue
                }
                return itemValue as T
            }

            return parsed
        } catch (error) {
            console.error(`[useLocalStorageSync] Error reading ${key}:`, error)
            return initialValue
        }
    })

    const setValueWithStorage = useCallback(
        (newValue: T) => {
            try {
                setValue(newValue)

                if (typeof window === 'undefined') return

                const toStore = ttl ? JSON.stringify({
                    value: newValue,
                    timestamp: Date.now(),
                    ttl,
                }) : (json ? JSON.stringify(newValue) : newValue as any)

                localStorage.setItem(key, toStore as string)
            } catch (error) {
                console.error(`[useLocalStorageSync] Error setting ${key}:`, error)
            }
        },
        [key, ttl, json]
    )

    const remove = useCallback(() => {
        setValue(initialValue)
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key)
        }
    }, [key, initialValue])

    const clear = useCallback(() => {
        remove()
    }, [remove])

    // Listen to storage changes from other tabs
    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue) {
                try {
                    const parsed = json ? JSON.parse(event.newValue) : (event.newValue as any as T)

                    if (ttl && typeof parsed === 'object' && parsed !== null && 'timestamp' in parsed) {
                        const { timestamp, ttl: itemTtl, value: itemValue } = parsed as any
                        if (Date.now() - timestamp > itemTtl) {
                            setValue(initialValue)
                        } else {
                            setValue(itemValue as T)
                        }
                    } else {
                        setValue(parsed)
                    }
                } catch (error) {
                    console.error(`[useLocalStorageSync] Error parsing ${key}:`, error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key, ttl, json, initialValue])

    return {
        value,
        setValue: setValueWithStorage,
        remove,
        clear,
    }
}