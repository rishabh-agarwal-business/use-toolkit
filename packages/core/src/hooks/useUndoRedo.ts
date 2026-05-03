import { useCallback, useState } from 'react'
import { UndoRedoHistory, UseUndoRedoOptions, UseUndoRedoReturn } from './types'

export function useUndoRedo<T>(
    initialState: T,
    options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> {
    const { maxHistorySize = 50 } = options

    const [history, setHistory] = useState<UndoRedoHistory<T>>({
        past: [],
        present: initialState,
        future: [],
    })

    const setState = useCallback((newState: T) => {
        setHistory((prev) => {
            const newPast = [...prev.past, prev.present]
            if (newPast.length > maxHistorySize) {
                newPast.shift()
            }

            return {
                past: newPast,
                present: newState,
                future: [],
            }
        })
    }, [maxHistorySize])

    const undo = useCallback(() => {
        setHistory((prev) => {
            if (prev.past.length === 0) return prev

            const newPast = [...prev.past]
            const newPresent = newPast.pop()!
            const newFuture = [prev.present, ...prev.future]

            if (newFuture.length > maxHistorySize) {
                newFuture.pop()
            }

            return {
                past: newPast,
                present: newPresent,
                future: newFuture,
            }
        })
    }, [maxHistorySize])

    const redo = useCallback(() => {
        setHistory((prev) => {
            if (prev.future.length === 0) return prev

            const newFuture = [...prev.future]
            const newPresent = newFuture.shift()!
            const newPast = [...prev.past, prev.present]

            if (newPast.length > maxHistorySize) {
                newPast.shift()
            }

            return {
                past: newPast,
                present: newPresent,
                future: newFuture,
            }
        })
    }, [maxHistorySize])

    const reset = useCallback((newState: T) => {
        setHistory({
            past: [],
            present: newState,
            future: [],
        })
    }, [])

    const clearHistory = useCallback(() => {
        setHistory((prev) => ({
            past: [],
            present: prev.present,
            future: [],
        }))
    }, [])

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        history,
        reset,
        clearHistory,
    }
}