import { useCallback, useEffect, useRef, useState } from 'react'
import { VirtualizedListConfig, VirtualizedListItem, VirtualizedListReturn } from './types'
import { calculateVisibleRange } from '../utils/helpers'

export function useVirtualizedList<T extends VirtualizedListItem>(
    items: T[],
    config: VirtualizedListConfig
): VirtualizedListReturn {
    const {
        itemHeight,
        estimatedItemHeight = 50,
        overscan = 3,
        containerHeight = 600,
    } = config

    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeightsRef = useRef<Map<number, number>>(new Map())

    const { start, end, offset } = calculateVisibleRange(
        scrollTop,
        typeof containerHeight === 'string' ? 600 : containerHeight,
        itemHeight,
        items.length,
        overscan,
        itemHeight === 'auto' ? itemHeightsRef.current : undefined
    )

    const visibleItems = items.slice(start, end)

    let totalHeight = 0
    if (itemHeight !== 'auto') {
        totalHeight = items.length * itemHeight
    } else {
        let sum = 0
        for (let i = 0; i < items.length; i++) {
            sum += itemHeightsRef.current.get(i) || estimatedItemHeight
        }
        totalHeight = sum
    }

    const handleScroll = useCallback((e: Event) => {
        const target = e.target as HTMLDivElement
        setScrollTop(target.scrollTop)
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    const containerStyle: React.CSSProperties = {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
    }

    const scrollerStyle: React.CSSProperties = {
        height: totalHeight,
        position: 'relative',
    }

    return {
        visibleItems,
        containerStyle,
        scrollerStyle,
        offsetY: offset,
        totalHeight,
        startIndex: start,
        endIndex: end,
    }
}