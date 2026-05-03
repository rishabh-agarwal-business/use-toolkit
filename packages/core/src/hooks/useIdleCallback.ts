import { useCallback, useEffect, useRef, useState } from 'react'
import { UseIdleCallbackOptions, UseIdleCallbackReturn } from './types'

interface ScheduledTask {
    id: number
    callback: () => void | Promise<void>
    idleCallbackId?: number
    timeoutId?: NodeJS.Timeout
    isCompleted: boolean
}

export function useIdleCallback(options: UseIdleCallbackOptions = {}): UseIdleCallbackReturn {
    const { timeout = 1000 } = options

    const [pendingTaskCount, setPendingTaskCount] = useState(0)

    const tasksRef = useRef<Map<number, ScheduledTask>>(new Map())
    const idCounterRef = useRef(0)
    const isMountedRef = useRef(true)

    const isSupported = typeof window !== 'undefined' && 'requestIdleCallback' in window

    const executeTask = useCallback(
        async (task: ScheduledTask) => {
            if (!isMountedRef.current || task.isCompleted) {
                return
            }

            try {
                await task.callback()
                task.isCompleted = true

                if (isMountedRef.current) {
                    setPendingTaskCount((prev) => Math.max(0, prev - 1))
                }
            } catch (error) {
                console.error(`[useIdleCallback] Task ${task.id} error:`, error)
                task.isCompleted = true

                if (isMountedRef.current) {
                    setPendingTaskCount((prev) => Math.max(0, prev - 1))
                }
            } finally {
                tasksRef.current.delete(task.id)
            }
        },
        []
    )

    const scheduleTask = useCallback(
        (callback: () => void | Promise<void>): number => {
            if (!isMountedRef.current) {
                console.warn('[useIdleCallback] Component unmounted, task not scheduled')
                return -1
            }

            const taskId = ++idCounterRef.current

            const task: ScheduledTask = {
                id: taskId,
                callback,
                isCompleted: false,
            }

            tasksRef.current.set(taskId, task)

            if (isMountedRef.current) {
                setPendingTaskCount((prev) => prev + 1)
            }

            if (isSupported) {
                try {
                    const idleCallbackId = (window as any).requestIdleCallback(
                        () => executeTask(task),
                        { timeout }
                    )

                    task.idleCallbackId = idleCallbackId
                } catch (error) {
                    console.error('[useIdleCallback] requestIdleCallback failed:', error)
                    // Fallback to setTimeout
                    task.timeoutId = setTimeout(() => executeTask(task), 0)
                }
            } else {
                // Fallback to setTimeout
                task.timeoutId = setTimeout(() => executeTask(task), 0)
            }

            return taskId
        },
        [isSupported, timeout, executeTask]
    )

    const cancelTask = useCallback((taskId: number) => {
        const task = tasksRef.current.get(taskId)

        if (!task) {
            console.warn(`[useIdleCallback] Task ${taskId} not found`)
            return
        }


        // Cancel idle callback
        if (task.idleCallbackId !== undefined) {
            try {
                (window as any).cancelIdleCallback?.(task.idleCallbackId)
            } catch (error) {
                console.error('[useIdleCallback] Error cancelling idle callback:', error)
            }
        }

        // Clear timeout
        if (task.timeoutId) {
            clearTimeout(task.timeoutId)
        }

        task.isCompleted = true
        tasksRef.current.delete(taskId)

        if (isMountedRef.current) {
            setPendingTaskCount((prev) => Math.max(0, prev - 1))
        }
    }, [])

    const cancelAllTasks = useCallback(() => {

        tasksRef.current.forEach((task, taskId) => {
            // Cancel idle callback
            if (task.idleCallbackId !== undefined) {
                try {
                    (window as any).cancelIdleCallback?.(task.idleCallbackId)
                } catch (error) {
                    console.error(`[useIdleCallback] Error cancelling task ${taskId}:`, error)
                }
            }

            // Clear timeout
            if (task.timeoutId) {
                clearTimeout(task.timeoutId)
            }

            task.isCompleted = true
        })

        tasksRef.current.clear()

        if (isMountedRef.current) {
            setPendingTaskCount(0)
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false
            cancelAllTasks()
        }
    }, [cancelAllTasks])

    return {
        scheduleTask,
        cancelTask,
        isSupported,
        pendingTaskCount,
    }
}