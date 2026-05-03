export function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) return false;

        return aKeys.every((key) => deepEqual((a as any)[key], (b as any)[key]));
    }

    return false;
}

export function createPromiseWithResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
} {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve: resolve!, reject: reject! };
}

export function calculateVisibleRange(
    scrollTop: number,
    containerHeight: number | undefined,
    itemHeight: number | 'auto',
    itemCount: number,
    overscan: number,
    heightMap?: Map<number, number>
): { start: number; end: number; offset: number } {
    const height = containerHeight || 600;

    if (itemHeight !== 'auto') {
        const start = Math.floor(scrollTop / (itemHeight as number));
        const visibleCount = Math.ceil(height / (itemHeight as number));
        const end = Math.min(start + visibleCount + overscan * 2, itemCount);
        const offset = start * (itemHeight as number);

        return {
            start: Math.max(0, start - overscan),
            end,
            offset,
        };
    }

    // Variable height calculation
    let accumulatedHeight = 0;
    let start = 0;

    for (let i = 0; i < itemCount; i++) {
        const itemH = heightMap?.get(i) || 50;
        if (accumulatedHeight + itemH >= scrollTop) {
            start = i;
            break;
        }
        accumulatedHeight += itemH;
    }

    let end = start;
    let visibleHeight = 0;

    for (let i = start; i < itemCount && visibleHeight < height; i++) {
        const itemH = heightMap?.get(i) || 50;
        visibleHeight += itemH;
        end = i + 1;
    }

    return {
        start: Math.max(0, start - overscan),
        end: Math.min(end + overscan, itemCount),
        offset: accumulatedHeight,
    };
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return function (...args: Parameters<T>) {
        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, delay);
    };
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return function (...args: Parameters<T>) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            func(...args);
            lastCall = now;
        }
    };
}