import { useCallback, useEffect, useRef, useState } from 'react'
import { UseWebSocketAdvancedOptions, UseWebSocketAdvancedReturn } from './types'

export function useWebSocketAdvanced<T = any>(
    url: string,
    options: UseWebSocketAdvancedOptions<T> = {}
): UseWebSocketAdvancedReturn<T> {
    const {
        onOpen,
        onMessage,
        onError,
        onClose,
        reconnectAttempts = 5,
        reconnectInterval = 3000,
        heartbeatInterval = 30000,
        shouldReconnect = () => true,
    } = options

    const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED)
    const [lastMessage, setLastMessage] = useState<T | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const messageQueueRef = useRef<(T | string | ArrayBuffer)[]>([])
    const isMountedRef = useRef(true)
    const isManualCloseRef = useRef(false)
    const reconnectCountRef = useRef(0)
    const isConnectingRef = useRef(false)

    const clearAllTimeouts = useCallback(() => {
        if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current)
            heartbeatTimeoutRef.current = null
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
    }, [])

    const startHeartbeat = useCallback(() => {
        clearAllTimeouts()

        if (!isMountedRef.current) return
        if (wsRef.current?.readyState !== WebSocket.OPEN) return

        heartbeatTimeoutRef.current = setTimeout(() => {
            try {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'ping' }))
                    console.log('[useWebSocketAdvanced] 💓 Heartbeat sent')
                }
            } catch (error) {
                console.error('[useWebSocketAdvanced] ❌ Heartbeat error:', error)
            }
        }, heartbeatInterval)
    }, [heartbeatInterval, clearAllTimeouts])

    const flushMessageQueue = useCallback(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return
        if (messageQueueRef.current.length === 0) return

        const queue = [...messageQueueRef.current]
        messageQueueRef.current = []

        console.log(`[useWebSocketAdvanced] 📤 Flushing ${queue.length} queued messages`)

        queue.forEach((message) => {
            try {
                if (typeof message === 'string') {
                    wsRef.current!.send(message)
                } else {
                    wsRef.current!.send(JSON.stringify(message))
                }
            } catch (error) {
                console.error('[useWebSocketAdvanced] ❌ Flush error:', error)
                messageQueueRef.current.push(message)
            }
        })
    }, [])

    const connect = useCallback(() => {
        // Prevent multiple connection attempts
        if (isConnectingRef.current) {
            console.log('[useWebSocketAdvanced] ⚠️ Already connecting')
            return
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('[useWebSocketAdvanced] ⚠️ Already connected')
            return
        }

        // Component unmounted or user closed manually
        if (!isMountedRef.current || isManualCloseRef.current) {
            return
        }

        // Max retries reached
        if (reconnectCountRef.current >= reconnectAttempts) {
            console.error(
                `[useWebSocketAdvanced] ❌ Max reconnection attempts reached (${reconnectAttempts})`
            )
            return
        }

        isConnectingRef.current = true
        console.log(
            `[useWebSocketAdvanced] 🔄 Connecting to ${url}... (attempt ${reconnectCountRef.current + 1}/${reconnectAttempts})`
        )

        try {
            wsRef.current = new WebSocket(url)

            wsRef.current.onopen = () => {
                if (!isMountedRef.current) return

                console.log('[useWebSocketAdvanced] ✅ Connected')
                setReadyState(WebSocket.OPEN)
                reconnectCountRef.current = 0
                isConnectingRef.current = false

                onOpen?.()
                flushMessageQueue()
                startHeartbeat()
            }

            wsRef.current.onmessage = (event) => {
                if (!isMountedRef.current) return

                try {
                    let data: T
                    try {
                        data = JSON.parse(event.data)
                    } catch {
                        data = event.data as T
                    }

                    setLastMessage(data)
                    onMessage?.(data)
                    startHeartbeat()
                } catch (error) {
                    console.error('[useWebSocketAdvanced] ❌ Message error:', error)
                }
            }

            wsRef.current.onerror = (event: Event) => {
                if (!isMountedRef.current) return

                console.error('[useWebSocketAdvanced] ❌ WebSocket error:', event)
                setReadyState(wsRef.current?.readyState ?? WebSocket.CLOSED)
                onError?.(event)
            }

            wsRef.current.onclose = (event: CloseEvent) => {
                if (!isMountedRef.current) return

                console.log('[useWebSocketAdvanced] 🔌 Disconnected', {
                    code: event.code,
                    reason: event.reason,
                })

                setReadyState(WebSocket.CLOSED)
                isConnectingRef.current = false
                onClose?.()
                clearAllTimeouts()

                // Auto-reconnect if appropriate
                if (!isManualCloseRef.current && shouldReconnect(event)) {
                    if (reconnectCountRef.current < reconnectAttempts) {
                        reconnectCountRef.current += 1
                        const delay = reconnectInterval * reconnectCountRef.current

                        console.log(
                            `[useWebSocketAdvanced] 🔄 Reconnecting in ${delay}ms... (${reconnectCountRef.current}/${reconnectAttempts})`
                        )

                        if (reconnectTimeoutRef.current) {
                            clearTimeout(reconnectTimeoutRef.current)
                        }

                        reconnectTimeoutRef.current = setTimeout(() => {
                            if (isMountedRef.current && !isManualCloseRef.current) {
                                connect()
                            }
                        }, delay)
                    }
                }
            }
        } catch (error) {
            console.error('[useWebSocketAdvanced] ❌ Connection error:', error)
            isConnectingRef.current = false
            setReadyState(WebSocket.CLOSED)
        }
    }, [url, reconnectAttempts, reconnectInterval, onOpen, onMessage, onError, onClose, shouldReconnect, flushMessageQueue, startHeartbeat, clearAllTimeouts])

    const send = useCallback(
        (data: T | string | ArrayBuffer) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                try {
                    if (typeof data === 'string' || data instanceof ArrayBuffer) {
                        wsRef.current.send(data)
                    } else {
                        wsRef.current.send(JSON.stringify(data))
                    }
                    console.log('[useWebSocketAdvanced] 📤 Message sent')
                } catch (error) {
                    console.error('[useWebSocketAdvanced] ❌ Send error:', error)
                    messageQueueRef.current.push(data)
                    console.log('[useWebSocketAdvanced] 📋 Message queued')
                }
            } else {
                messageQueueRef.current.push(data)
                console.log('[useWebSocketAdvanced] 📋 Message queued (not connected)')
            }
        },
        []
    )

    const sendJsonMessage = useCallback(
        <U,>(data: U) => {
            send(JSON.stringify(data) as any)
        },
        [send]
    )

    const reconnect = useCallback(() => {
        console.log('[useWebSocketAdvanced] 🔄 Manual reconnect requested')
        isManualCloseRef.current = false
        reconnectCountRef.current = 0
        isConnectingRef.current = false

        if (wsRef.current) {
            try {
                wsRef.current.close()
            } catch (error) {
                console.error('[useWebSocketAdvanced] Error closing:', error)
            }
            wsRef.current = null
        }

        clearAllTimeouts()
        connect()
    }, [connect, clearAllTimeouts])

    const disconnect = useCallback(() => {
        console.log('[useWebSocketAdvanced] 👋 Disconnecting')
        isManualCloseRef.current = true
        isConnectingRef.current = false
        clearAllTimeouts()

        if (wsRef.current) {
            try {
                wsRef.current.close()
            } catch (error) {
                console.error('[useWebSocketAdvanced] Error closing:', error)
            }
            wsRef.current = null
        }

        messageQueueRef.current = []
        setReadyState(WebSocket.CLOSED)
    }, [clearAllTimeouts])

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        isMountedRef.current = true
        isManualCloseRef.current = false
        reconnectCountRef.current = 0
        isConnectingRef.current = false

        connect()

        return () => {
            isMountedRef.current = false
            disconnect()
        }
    }, [connect, disconnect])

    return {
        send,
        sendJsonMessage,
        readyState,
        lastMessage,
        reconnect,
        disconnect,
    }
}