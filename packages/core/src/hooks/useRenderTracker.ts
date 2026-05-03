import { useEffect, useRef } from 'react'
import { UseRenderTrackerOptions, UseRenderTrackerReturn } from './types'
import { deepEqual } from '../utils/helpers'

export function useRenderTracker(
    options: UseRenderTrackerOptions = {}
): UseRenderTrackerReturn {
    const {
        name = 'Component',
        log = false,
        renderThreshold = 10,
        trackProps = true,
        props = {},
    } = options

    const renderCountRef = useRef(0)
    const renderHistoryRef = useRef<any[]>([])
    const previousPropsRef = useRef<Record<string, unknown>>({})

    renderCountRef.current += 1
    const currentRenderCount = renderCountRef.current

    const renderReasons: string[] = []

    if (currentRenderCount === 1) {
        renderReasons.push('Mount')
    } else {
        if (trackProps && Object.keys(props).length > 0) {
            const changedProps: string[] = []

            Object.entries(props).forEach(([key, value]) => {
                const prevValue = previousPropsRef.current[key]

                if (!deepEqual(value, prevValue)) {
                    changedProps.push(key)
                }
            })

            if (changedProps.length > 0) {
                renderReasons.push(`Props: ${changedProps.join(', ')}`)
            }
        }

        if (renderReasons.length === 0) {
            renderReasons.push('State/Context Update')
        }
    }

    useEffect(() => {
        const renderInfo = {
            renderCount: currentRenderCount,
            renderReason: renderReasons.join(' | '),
            timestamp: Date.now(),
            props: { ...props },
        }

        renderHistoryRef.current.push(renderInfo)

        if (renderHistoryRef.current.length > 50) {
            renderHistoryRef.current.shift()
        }

        if (log && typeof window !== 'undefined' && (window as any).__REACT_HOOKS_LIB_DEBUG__) {
            const color = currentRenderCount > renderThreshold ? '#ff6b6b' : '#51cf66'
            console.log(`%c[${name}] Render #${currentRenderCount}`, `color: ${color}; font-weight: bold`, {
                reason: renderReasons.join(' | '),
                totalProps: Object.keys(props).length,
            })
        }

        previousPropsRef.current = { ...props }
    }, [currentRenderCount, renderReasons, props, log, name, renderThreshold])

    const hasExcessiveRenders = currentRenderCount > renderThreshold

    return {
        renderCount: currentRenderCount,
        renderHistory: renderHistoryRef.current,
        lastRenderTime: Date.now(),
        renderReasons,
        hasExcessiveRenders,
        name,
    }
}