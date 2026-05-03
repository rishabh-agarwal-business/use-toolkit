import { useCallback, useEffect, useRef, useState } from 'react'
import { UseIntersectionObserverOptions, UseIntersectionObserverReturn } from './types'

export function useIntersectionObserverAdvanced(
    options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
    const {
        threshold = 0.1,
        root = null,
        rootMargin = '0px',
        once = false,
    } = options

    const [isIntersecting, setIsIntersecting] = useState(false)
    const [triggerCount, setTriggerCount] = useState(0)
    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

    const ref = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const hasTriggeredRef = useRef(false)

    useEffect(() => {
        if (!ref.current) return

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true)
                    setEntry(entry)

                    if (!hasTriggeredRef.current || !once) {
                        setTriggerCount((prev) => prev + 1)
                        hasTriggeredRef.current = true

                        if (once && observerRef.current && ref.current) {
                            observerRef.current.unobserve(ref.current)
                        }
                    }
                } else {
                    setIsIntersecting(false)
                    setEntry(entry)
                }
            })
        }

        observerRef.current = new IntersectionObserver(handleIntersection, {
            root,
            rootMargin,
            threshold,
        })

        observerRef.current.observe(ref.current)

        return () => {
            if (observerRef.current && ref.current) {
                observerRef.current.unobserve(ref.current)
                observerRef.current.disconnect()
            }
        }
    }, [threshold, root, rootMargin, once])

    return {
        ref,
        isIntersecting,
        triggerCount,
        entry,
    }
}

// For multiple elements
export function useIntersectionObserverMultiple(
    options: UseIntersectionObserverOptions = {}
): {
    observe: (ref: React.RefObject<HTMLElement>, id: string) => void
    unobserve: (id: string) => void
    visibleElements: Set<string>
} {
    const {
        threshold = 0.1,
        root = null,
        rootMargin = '0px',
    } = options

    const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
    const refsMapRef = useRef<Map<string, HTMLElement>>(new Map())
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            setVisibleElements((prev) => {
                const newSet = new Set(prev)
                entries.forEach((entry) => {
                    const id = Array.from(refsMapRef.current.entries()).find(
                        ([, el]) => el === entry.target
                    )?.[0]

                    if (id) {
                        if (entry.isIntersecting) {
                            newSet.add(id)
                        } else {
                            newSet.delete(id)
                        }
                    }
                })
                return newSet
            })
        }

        observerRef.current = new IntersectionObserver(handleIntersection, {
            root,
            rootMargin,
            threshold,
        })

        return () => {
            observerRef.current?.disconnect()
        }
    }, [threshold, root, rootMargin])

    const observe = useCallback((ref: React.RefObject<HTMLElement>, id: string) => {
        if (ref.current) {
            refsMapRef.current.set(id, ref.current)
            observerRef.current?.observe(ref.current)
        }
    }, [])

    const unobserve = useCallback((id: string) => {
        const element = refsMapRef.current.get(id)
        if (element) {
            observerRef.current?.unobserve(element)
            refsMapRef.current.delete(id)
        }
    }, [])

    return { observe, unobserve, visibleElements }
}