export class CacheManager<T = unknown> {
    private cache = new Map<string, { data: T; timestamp: number; error?: Error }>();
    private staleTime = new Map<string, number>();

    set(key: string, value: T, staleTime: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now(),
        });
        this.staleTime.set(key, staleTime);
    }

    get(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;
        return cached.data;
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    isStale(key: string): boolean {
        const cached = this.cache.get(key);
        if (!cached) return true;

        const staleTime = this.staleTime.get(key) || 0;
        return Date.now() - cached.timestamp > staleTime;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
        this.staleTime.delete(key);
    }

    invalidateByPrefix(prefix: string): void {
        Array.from(this.cache.keys()).forEach((key) => {
            if (key.startsWith(prefix)) {
                this.invalidate(key);
            }
        });
    }

    clear(): void {
        this.cache.clear();
        this.staleTime.clear();
    }

    getSize(): number {
        return this.cache.size;
    }
}

export const queryCache = new CacheManager();

export function clearQueryCache(): void {
    queryCache.clear();
}

export function invalidateQuery(queryKey: any[]): void {
    const key = JSON.stringify(queryKey);
    queryCache.invalidate(key);
}

export function invalidateQueries(prefix: string): void {
    queryCache.invalidateByPrefix(prefix);
}