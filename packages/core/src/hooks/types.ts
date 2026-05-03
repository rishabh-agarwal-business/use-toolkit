// Query and Mutation Types
export interface QueryKey extends Array<any> {
    0: string | string[];
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    error?: Error;
}

export interface UseQueryLiteOptions<T = unknown> {
    staleTime?: number;
    cacheTime?: number;
    retries?: number;
    retryDelay?: number | ((attempt: number) => number);
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
    onSettled?: () => void | Promise<void>;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
}

export interface UseQueryLiteReturn<T = unknown, E = Error> {
    data: T | null;
    error: E | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isStale: boolean;
    refetch: () => Promise<T | undefined>;
    isFetching: boolean;
    dataUpdatedAt: number;
}

export interface UseMutationLiteOptions<T = unknown, E = Error> {
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: E) => void | Promise<void>;
    onSettled?: () => void | Promise<void>;
    invalidateQueries?: QueryKey[];
    retry?: number;
    retryDelay?: number;
}

export interface UseMutationLiteReturn<T = unknown, V = void, E = Error> {
    mutate: (variables: V) => void
    mutateAsync: (variables: V) => Promise<T>;
    data: T | null;
    error: E | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    reset: () => void;
    variables: V | null;
}

// WebSocket Types
export interface UseWebSocketAdvancedOptions<T = unknown> {
    onOpen?: () => void;
    onMessage?: (data: T) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    heartbeatInterval?: number;
    shouldReconnect?: (event: CloseEvent) => boolean;
}

export interface UseWebSocketAdvancedReturn<T = unknown> {
    send: (data: T | string | ArrayBuffer) => void;
    readyState: number;
    lastMessage: T | null;
    sendJsonMessage: <U>(data: U) => void;
    reconnect: () => void;
    disconnect: () => void;
}

// Network Types
export interface UseNetworkStateReturn {
    online: boolean;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    isSlow: boolean;
    isUnstable: boolean;
}

// State Machine Types
export interface StateMachineConfig<T extends string = string, E extends string = string> {
    initial: T;
    transitions: Record<T, Partial<Record<E, T>>>;
    onEnter?: Partial<Record<T, () => void>>;
    onExit?: Partial<Record<T, () => void>>;
    onTransition?: (from: T, to: T, event: E) => void;
}

export interface UseStateMachineReturn<T extends string = string, E extends string = string> {
    state: T;
    send: (event: E) => void;
    can: (event: E) => boolean;
    getValidEvents: () => E[];
}

// Undo/Redo Types
export interface UndoRedoHistory<T> {
    past: T[];
    present: T;
    future: T[];
}

export interface UseUndoRedoOptions {
    maxHistorySize?: number;
}

export interface UseUndoRedoReturn<T> {
    state: T;
    setState: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    history: UndoRedoHistory<T>;
    reset: (newState: T) => void;
    clearHistory: () => void;
}

// Storage Types
export interface UseLocalStorageSyncOptions {
    ttl?: number;
    json?: boolean;
}

export interface UseLocalStorageSyncReturn<T> {
    value: T;
    setValue: (value: T) => void;
    remove: () => void;
    clear: () => void;
}

// IndexedDB Types
export interface IndexedDBConfig {
    name: string;
    keyPath?: string | string[];
    autoIncrement?: boolean;
    indexes?: Array<{
        name: string;
        keyPath: string | string[];
        unique?: boolean;
    }>;
}

export interface UseIndexedDBReturn<T extends { id?: any } = any> {
    db: IDBDatabase | null;
    put: (item: T) => Promise<IDBValidKey>;
    get: (key: any) => Promise<T | undefined>;
    getAll: () => Promise<T[]>;
    delete: (key: any) => Promise<void>;
    clear: () => Promise<void>;
    query: (index: string, value: any) => Promise<T[]>;
    lastOperation: 'idle' | 'pending' | 'success' | 'error';
    error: Error | null;
    isReady: boolean;
}

// Intersection Observer Types
export interface UseIntersectionObserverOptions {
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
    once?: boolean;
}

export interface UseIntersectionObserverReturn {
    ref: React.RefObject<HTMLDivElement>;
    isIntersecting: boolean;
    triggerCount: number;
    entry: IntersectionObserverEntry | null;
}

// Render Tracker Types
export interface UseRenderTrackerOptions {
    name?: string;
    log?: boolean;
    renderThreshold?: number;
    trackProps?: boolean;
    props?: Record<string, unknown>;
}

export interface UseRenderTrackerReturn {
    renderCount: number;
    renderHistory: any[];
    lastRenderTime: number;
    renderReasons: string[];
    hasExcessiveRenders: boolean;
    name: string;
}

// Idle Callback Types
export interface UseIdleCallbackOptions {
    timeout?: number;
}

export interface UseIdleCallbackReturn {
    scheduleTask: (callback: () => void | Promise<void>) => number;
    cancelTask: (taskId: number) => void;
    isSupported: boolean;
    pendingTaskCount: number;
}

// Virtualized List Types
export interface VirtualizedListItem {
    name: string;
    email: string;
    status: any;
    joinDate: string;
    id?: string | number;
}

export interface VirtualizedListConfig {
    itemHeight: number | 'auto';
    estimatedItemHeight?: number;
    overscan?: number;
    containerHeight?: number | string;
}

export interface VirtualizedListReturn {
    visibleItems: VirtualizedListItem[];
    containerStyle: React.CSSProperties;
    scrollerStyle: React.CSSProperties;
    offsetY: number;
    totalHeight: number;
    startIndex: number;
    endIndex: number;
}