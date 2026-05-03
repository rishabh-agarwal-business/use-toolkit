import { useCallback, useEffect, useRef, useState } from 'react'
import { QueryKey, UseQueryLiteOptions, UseQueryLiteReturn } from './types'
import { queryCache } from '../utils/cache'

export function useQueryLite<T = unknown, E = Error>(
    queryKey: QueryKey,
    queryFn: (signal: AbortSignal) => Promise<T>,
    options: UseQueryLiteOptions<T> = {}
): UseQueryLiteReturn<T, E> {
    const {
        staleTime = 5 * 60 * 1000,
        cacheTime = 10 * 60 * 1000,
        retries = 3,
        retryDelay = 1000,
        onSuccess,
        onError,
        onSettled,
        enabled = true,
    } = options

    const [state, setState] = useState<{
        data: T | null
        error: E | null
        isLoading: boolean
        isError: boolean
        isSuccess: boolean
        dataUpdatedAt: number
    }>({
        data: null,
        error: null,
        isLoading: enabled,
        isError: false,
        isSuccess: false,
        dataUpdatedAt: 0,
    })

    const serializedKey = JSON.stringify(queryKey)
    const cacheKeyRef = useRef(serializedKey)
    const controllerRef = useRef<AbortController | null>(null)
    const retryCountRef = useRef(0)
    const isMountedRef = useRef(true)

    // Stable refs for callbacks
    const queryFnRef = useRef(queryFn)
    const onSuccessRef = useRef(onSuccess)
    const onErrorRef = useRef(onError)
    const onSettledRef = useRef(onSettled)

    useEffect(() => {
        queryFnRef.current = queryFn
        onSuccessRef.current = onSuccess
        onErrorRef.current = onError
        onSettledRef.current = onSettled
    })

    const fetchData = useCallback(
        async (skipCache = false): Promise<T | undefined> => {
            if (!enabled) return

            const cacheKey = serializedKey
            cacheKeyRef.current = cacheKey

            // Serve cached data
            if (
                !skipCache &&
                queryCache.has(cacheKey) &&
                !queryCache.isStale(cacheKey)
            ) {
                const cached = queryCache.get(cacheKey) as T

                if (isMountedRef.current) {
                    setState({
                        data: cached,
                        error: null,
                        isLoading: false,
                        isError: false,
                        isSuccess: true,
                        dataUpdatedAt: Date.now(),
                    })
                }

                return cached
            }

            if (isMountedRef.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: true,
                    isError: false,
                }))
            }

            try {
                controllerRef.current?.abort()
                controllerRef.current = new AbortController()

                const data = await queryFnRef.current(
                    controllerRef.current.signal
                )

                if (!isMountedRef.current) return data

                // Cache data
                queryCache.set(cacheKey, data, staleTime)

                setState({
                    data,
                    error: null,
                    isLoading: false,
                    isError: false,
                    isSuccess: true,
                    dataUpdatedAt: Date.now(),
                })

                retryCountRef.current = 0

                await onSuccessRef.current?.(data)
                await onSettledRef.current?.()

                return data
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    return
                }

                const err = error as E

                if (retryCountRef.current < retries) {
                    retryCountRef.current += 1

                    const delay =
                        typeof retryDelay === 'function'
                            ? retryDelay(retryCountRef.current)
                            : retryDelay

                    await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                    )

                    return fetchData(skipCache)
                }

                if (isMountedRef.current) {
                    setState({
                        data: null,
                        error: err,
                        isLoading: false,
                        isError: true,
                        isSuccess: false,
                        dataUpdatedAt: Date.now(),
                    })
                }

                await onErrorRef.current?.(err as Error)
                await onSettledRef.current?.()

                throw err
            }
        },
        [serializedKey, enabled, staleTime, retries, retryDelay]
    )

    const refetch = useCallback((): Promise<T | undefined> => {
        retryCountRef.current = 0
        return fetchData(true)
    }, [fetchData])

    useEffect(() => {
        isMountedRef.current = true

        fetchData()

        return () => {
            isMountedRef.current = false
            controllerRef.current?.abort()
        }
    }, [fetchData])

    const isStale = queryCache.isStale(cacheKeyRef.current)

    return {
        ...state,
        refetch,
        isFetching: state.isLoading,
        isStale,
    }
}