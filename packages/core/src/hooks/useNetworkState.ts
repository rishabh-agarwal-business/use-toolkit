import { useEffect, useState } from 'react'
import { UseNetworkStateReturn } from './types'

function getDefaultNetworkState(): Omit<UseNetworkStateReturn, 'isSlow' | 'isUnstable'> {
    if (typeof window === 'undefined') {
        return { online: true, effectiveType: '4g' }
    }

    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection

    return {
        online: navigator.onLine,
        effectiveType: (connection?.effectiveType || '4g') as any,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData || false,
    }
}

export function useNetworkState(): UseNetworkStateReturn {
    const [networkState, setNetworkState] = useState(getDefaultNetworkState)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleOnline = () => {
            setNetworkState((prev) => ({ ...prev, online: true }))
        }

        const handleOffline = () => {
            setNetworkState((prev) => ({ ...prev, online: false }))
        }

        const handleConnectionChange = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection

            setNetworkState((prev) => ({
                ...prev,
                effectiveType: (connection?.effectiveType || prev.effectiveType) as any,
                downlink: connection?.downlink,
                rtt: connection?.rtt,
                saveData: connection?.saveData || false,
            }))
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection

        if (connection) {
            connection.addEventListener('change', handleConnectionChange)
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            if (connection) {
                connection.removeEventListener('change', handleConnectionChange)
            }
        }
    }, [])

    const isSlow =
        networkState.effectiveType === '2g' ||
        networkState.effectiveType === 'slow-2g' ||
        ((networkState.rtt ?? 0) > 400)

    const isUnstable =
        !networkState.online ||
        networkState.effectiveType === '2g' ||
        networkState.effectiveType === 'slow-2g'

    return { ...networkState, isSlow, isUnstable }
}