import { useCallback, useEffect, useRef, useState } from 'react'
import { IndexedDBConfig, UseIndexedDBReturn } from './types'

const DB_VERSION = 1

export function useIndexedDB<T extends { id?: any } = any>(
    dbName: string,
    storeConfig: IndexedDBConfig
): UseIndexedDBReturn<T> {
    const [db, setDb] = useState<IDBDatabase | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [lastOperation, setLastOperation] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const [isReady, setIsReady] = useState(false)

    const dbRef = useRef<IDBDatabase | null>(null)
    const initializingRef = useRef(false)
    const isMountedRef = useRef(true)
    const storeName = storeConfig.name

    // Validate IndexedDB support
    const isIndexedDBSupported = useCallback(() => {
        return typeof window !== 'undefined' && !!window.indexedDB
    }, [])

    // Initialize database
    useEffect(() => {
        if (initializingRef.current || dbRef.current) {
            return
        }

        if (!isIndexedDBSupported()) {
            const err = new Error('IndexedDB not supported in this browser')
            console.error('[useIndexedDB] ❌', err.message)
            if (isMountedRef.current) {
                setError(err)
                setLastOperation('error')
                setIsReady(false)
            }
            return
        }

        initializingRef.current = true

        const initDB = () => {
            try {
                const request = window.indexedDB.open(dbName, DB_VERSION)

                // Handle errors
                request.onerror = () => {
                    const errorMsg = request.error?.message || 'Unknown error'
                    console.error('[useIndexedDB] ❌ Failed to open database:', errorMsg)

                    if (errorMsg.includes('QuotaExceededError')) {
                        const err = new Error('Storage quota exceeded. Free up some space.')
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                    } else {
                        const err = new Error(`Failed to open IndexedDB: ${errorMsg}`)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                    }

                    initializingRef.current = false
                }

                // Handle success
                request.onsuccess = () => {
                    const database = request.result

                    // Close old connection if exists
                    if (dbRef.current && dbRef.current !== database) {
                        dbRef.current.close()
                    }

                    dbRef.current = database

                    // Handle version change (another tab/window updated schema)
                    database.onversionchange = () => {
                        console.warn('[useIndexedDB] ⚠️ Database version changed in another tab')
                        database.close()
                        dbRef.current = null

                        if (isMountedRef.current) {
                            setDb(null)
                            setIsReady(false)
                            setError(new Error('Database was updated in another tab. Please refresh.'))
                        }
                    }

                    // Handle abort
                    database.onabort = () => {
                        console.warn('[useIndexedDB] ⚠️ Database transaction aborted')
                        if (isMountedRef.current) {
                            setError(new Error('Database transaction was aborted'))
                        }
                    }

                    if (isMountedRef.current) {
                        setDb(database)
                        setError(null)
                        setLastOperation('success')
                        setIsReady(true)
                    }

                    initializingRef.current = false
                }

                // Handle upgrade needed
                request.onupgradeneeded = (event) => {
                    const database = (event.target as IDBOpenDBRequest).result

                    try {
                        // Create object store if it doesn't exist
                        if (!database.objectStoreNames.contains(storeName)) {
                            const options: IDBObjectStoreParameters = {}

                            if (storeConfig.keyPath) {
                                options.keyPath = storeConfig.keyPath
                            }

                            if (storeConfig.autoIncrement !== undefined) {
                                options.autoIncrement = storeConfig.autoIncrement
                            }

                            const store = database.createObjectStore(storeName, options)

                            // Create indexes
                            if (storeConfig.indexes && storeConfig.indexes.length > 0) {
                                storeConfig.indexes.forEach((index) => {
                                    try {
                                        store.createIndex(index.name, index.keyPath, {
                                            unique: index.unique ?? false,
                                        })
                                    } catch (err) {
                                        throw new Error(`[useIndexedDB] ⚠️ Index already exists: ${index.name}`)
                                    }
                                })
                            }

                        }
                    } catch (err) {
                        throw new Error(`[useIndexedDB] ❌ Error during upgrade: ${err}`);
                    }
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error')
                console.error('[useIndexedDB] ❌ Connection error:', error.message)

                if (isMountedRef.current) {
                    setError(error)
                    setLastOperation('error')
                    setIsReady(false)
                }

                initializingRef.current = false
            }
        }

        initDB()

        return () => {
            isMountedRef.current = false
        }
    }, [dbName, storeName, isIndexedDBSupported])

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true

        return () => {
            isMountedRef.current = false
            if (dbRef.current) {
                dbRef.current.close()
                dbRef.current = null
            }
        }
    }, [])

    // PUT operation
    const put = useCallback(
        async (item: T): Promise<IDBValidKey> => {
            if (!dbRef.current) {
                throw new Error('Database not initialized. Wait for isReady to be true.')
            }

            if (!isMountedRef.current) {
                throw new Error('Component unmounted')
            }

            return new Promise((resolve, reject) => {
                try {
                    const transaction = dbRef.current!.transaction(storeName, 'readwrite')
                    const store = transaction.objectStore(storeName)
                    const request = store.put(item)

                    request.onsuccess = () => {
                        const key = request.result
                        if (isMountedRef.current) {
                            setLastOperation('success')
                            setError(null)
                        }
                        resolve(key)
                    }

                    request.onerror = () => {
                        const errorMsg = request.error?.message || 'Unknown error'
                        console.error('[useIndexedDB] ❌ Put failed:', errorMsg)

                        if (errorMsg.includes('QuotaExceededError')) {
                            const err = new Error('Storage quota exceeded')
                            if (isMountedRef.current) setError(err)
                            reject(err)
                        } else {
                            const err = new Error(`Failed to save item: ${errorMsg}`)
                            if (isMountedRef.current) setError(err)
                            reject(err)
                        }

                        if (isMountedRef.current) setLastOperation('error')
                    }

                    transaction.onerror = () => {
                        const err = new Error(`Transaction error: ${transaction.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }

                    transaction.onabort = () => {
                        const err = new Error('Transaction aborted')
                        console.warn('[useIndexedDB] ⚠️', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }
                } catch (err) {
                    const error = err instanceof Error ? err : new Error('Unknown error')
                    console.error('[useIndexedDB] ❌', error.message)
                    if (isMountedRef.current) setError(error)
                    reject(error)
                }
            })
        },
        [storeName]
    )

    // GET operation
    const get = useCallback(
        async (key: any): Promise<T | undefined> => {
            if (!dbRef.current) {
                throw new Error('Database not initialized. Wait for isReady to be true.')
            }

            if (!isMountedRef.current) {
                throw new Error('Component unmounted')
            }

            return new Promise((resolve, reject) => {
                try {
                    const transaction = dbRef.current!.transaction(storeName, 'readonly')
                    const store = transaction.objectStore(storeName)
                    const request = store.get(key)

                    request.onsuccess = () => {
                        const result = request.result
                        if (isMountedRef.current) {
                            setLastOperation('success')
                            setError(null)
                        }
                        resolve(result)
                    }

                    request.onerror = () => {
                        const err = new Error(`Failed to get item: ${request.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }

                    transaction.onerror = () => {
                        const err = new Error(`Transaction error: ${transaction.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }
                } catch (err) {
                    const error = err instanceof Error ? err : new Error('Unknown error')
                    console.error('[useIndexedDB] ❌', error.message)
                    if (isMountedRef.current) setError(error)
                    reject(error)
                }
            })
        },
        [storeName]
    )

    // GET ALL operation
    const getAll = useCallback(async (): Promise<T[]> => {
        if (!dbRef.current) {
            throw new Error('Database not initialized. Wait for isReady to be true.')
        }

        if (!isMountedRef.current) {
            throw new Error('Component unmounted')
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = dbRef.current!.transaction(storeName, 'readonly')
                const store = transaction.objectStore(storeName)
                const request = store.getAll()

                request.onsuccess = () => {
                    const results = request.result as T[]
                    if (isMountedRef.current) {
                        setLastOperation('success')
                        setError(null)
                    }
                    resolve(results)
                }

                request.onerror = () => {
                    const err = new Error(`Failed to get items: ${request.error?.message}`)
                    console.error('[useIndexedDB] ❌', err.message)
                    if (isMountedRef.current) {
                        setError(err)
                        setLastOperation('error')
                    }
                    reject(err)
                }

                transaction.onerror = () => {
                    const err = new Error(`Transaction error: ${transaction.error?.message}`)
                    console.error('[useIndexedDB] ❌', err.message)
                    if (isMountedRef.current) {
                        setError(err)
                        setLastOperation('error')
                    }
                    reject(err)
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error')
                console.error('[useIndexedDB] ❌', error.message)
                if (isMountedRef.current) setError(error)
                reject(error)
            }
        })
    }, [storeName])

    // DELETE operation
    const deleteItem = useCallback(
        async (key: any): Promise<void> => {
            if (!dbRef.current) {
                throw new Error('Database not initialized. Wait for isReady to be true.')
            }

            if (!isMountedRef.current) {
                throw new Error('Component unmounted')
            }

            return new Promise((resolve, reject) => {
                try {
                    const transaction = dbRef.current!.transaction(storeName, 'readwrite')
                    const store = transaction.objectStore(storeName)
                    const request = store.delete(key)

                    request.onsuccess = () => {
                        if (isMountedRef.current) {
                            setLastOperation('success')
                            setError(null)
                        }
                        resolve()
                    }

                    request.onerror = () => {
                        const err = new Error(`Failed to delete item: ${request.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }

                    transaction.onerror = () => {
                        const err = new Error(`Transaction error: ${transaction.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }
                } catch (err) {
                    const error = err instanceof Error ? err : new Error('Unknown error')
                    console.error('[useIndexedDB] ❌', error.message)
                    if (isMountedRef.current) setError(error)
                    reject(error)
                }
            })
        },
        [storeName]
    )

    // CLEAR operation
    const clear = useCallback(async (): Promise<void> => {
        if (!dbRef.current) {
            throw new Error('Database not initialized. Wait for isReady to be true.')
        }

        if (!isMountedRef.current) {
            throw new Error('Component unmounted')
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = dbRef.current!.transaction(storeName, 'readwrite')
                const store = transaction.objectStore(storeName)
                const request = store.clear()

                request.onsuccess = () => {
                    if (isMountedRef.current) {
                        setLastOperation('success')
                        setError(null)
                    }
                    resolve()
                }

                request.onerror = () => {
                    const err = new Error(`Failed to clear store: ${request.error?.message}`)
                    console.error('[useIndexedDB] ❌', err.message)
                    if (isMountedRef.current) {
                        setError(err)
                        setLastOperation('error')
                    }
                    reject(err)
                }

                transaction.onerror = () => {
                    const err = new Error(`Transaction error: ${transaction.error?.message}`)
                    console.error('[useIndexedDB] ❌', err.message)
                    if (isMountedRef.current) {
                        setError(err)
                        setLastOperation('error')
                    }
                    reject(err)
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error')
                console.error('[useIndexedDB] ❌', error.message)
                if (isMountedRef.current) setError(error)
                reject(error)
            }
        })
    }, [storeName])

    // QUERY operation (by index)
    const query = useCallback(
        async (index: string, value: any): Promise<T[]> => {
            if (!dbRef.current) {
                throw new Error('Database not initialized. Wait for isReady to be true.')
            }

            if (!isMountedRef.current) {
                throw new Error('Component unmounted')
            }

            return new Promise((resolve, reject) => {
                try {
                    const transaction = dbRef.current!.transaction(storeName, 'readonly')
                    const store = transaction.objectStore(storeName)

                    if (!store.indexNames.contains(index)) {
                        const err = new Error(`Index not found: ${index}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) setError(err)
                        reject(err)
                        return
                    }

                    const indexObj = store.index(index)
                    const request = indexObj.getAll(value)

                    request.onsuccess = () => {
                        const results = request.result as T[]
                        if (isMountedRef.current) {
                            setLastOperation('success')
                            setError(null)
                        }
                        resolve(results)
                    }

                    request.onerror = () => {
                        const err = new Error(`Query failed: ${request.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }

                    transaction.onerror = () => {
                        const err = new Error(`Transaction error: ${transaction.error?.message}`)
                        console.error('[useIndexedDB] ❌', err.message)
                        if (isMountedRef.current) {
                            setError(err)
                            setLastOperation('error')
                        }
                        reject(err)
                    }
                } catch (err) {
                    const error = err instanceof Error ? err : new Error('Unknown error')
                    console.error('[useIndexedDB] ❌', error.message)
                    if (isMountedRef.current) setError(error)
                    reject(error)
                }
            })
        },
        [storeName]
    )

    return {
        db: isReady ? db : null,
        put,
        get,
        getAll,
        delete: deleteItem,
        clear,
        query,
        lastOperation,
        error,
        isReady,
    }
}