import { useCallback, useReducer, useRef } from 'react'
import { UseMutationLiteOptions, UseMutationLiteReturn } from './types'
import { invalidateQuery } from '../utils/cache'

type MutationState<T, E> =
    | { status: 'idle' }
    | { status: 'pending' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: E }

export function useMutationLite<T = unknown, V = void, E = Error>(
    mutationFn: (variables: V, signal: AbortSignal) => Promise<T>,
    options: UseMutationLiteOptions<T, E> = {}
): UseMutationLiteReturn<T, V, E> {
    const {
        onSuccess,
        onError,
        onSettled,
        invalidateQueries = [],
        retry = 0,
        retryDelay = 1000,
    } = options

    const [state, dispatch] = useReducer(
        (state: MutationState<T, E>, action: { type: string; payload?: any }): MutationState<T, E> => {
            switch (action.type) {
                case 'pending':
                    return { status: 'pending' }
                case 'success':
                    return { status: 'success', data: action.payload }
                case 'error':
                    return { status: 'error', error: action.payload }
                case 'reset':
                    return { status: 'idle' }
                default:
                    return state
            }
        },
        { status: 'idle' } as MutationState<T, E>
    )

    const variablesRef = useRef<V | null>(null)
    const controllerRef = useRef<AbortController | null>(null)
    const retryCountRef = useRef(0)

    const mutateAsync = useCallback(
        async (variables: V): Promise<T> => {
            if (controllerRef.current) {
                controllerRef.current.abort()
            }

            variablesRef.current = variables
            controllerRef.current = new AbortController()

            dispatch({ type: 'pending' })

            try {
                const result = await mutationFn(variables, controllerRef.current.signal)

                // Invalidate related queries
                invalidateQueries.forEach((queryKey) => {
                    invalidateQuery(queryKey)
                })

                dispatch({ type: 'success', payload: result })

                await onSuccess?.(result)
                await onSettled?.()

                retryCountRef.current = 0
                return result
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    throw error
                }

                const err = error as E

                if (retryCountRef.current < retry) {
                    retryCountRef.current += 1
                    await new Promise((resolve) => setTimeout(resolve, retryDelay))
                    return mutateAsync(variables)
                }

                dispatch({ type: 'error', payload: err })

                await onError?.(err)
                await onSettled?.()

                throw err
            }
        },
        [mutationFn, onSuccess, onError, onSettled, invalidateQueries, retry, retryDelay]
    )

    const mutate = useCallback(
        (variables: V): void => {
            mutateAsync(variables).catch(() => {
                // Error already handled
            })
        },
        [mutateAsync]
    )

    const reset = useCallback(() => {
        if (controllerRef.current) {
            controllerRef.current.abort()
        }
        dispatch({ type: 'reset' })
        variablesRef.current = null
        retryCountRef.current = 0
    }, [])

    return {
        mutate,
        mutateAsync,
        data: state.status === 'success' ? state.data : null,
        error: state.status === 'error' ? state.error : null,
        isLoading: state.status === 'pending',
        isPending: state.status === 'pending',
        isError: state.status === 'error',
        isSuccess: state.status === 'success',
        reset,
        variables: variablesRef.current,
    }
}