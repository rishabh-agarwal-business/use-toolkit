import React, { useState } from 'react'
import UseQueryLiteDemo from './useQueryLite'
import UseMutationLiteDemo from './useMutationLite'
import UseWebSocketAdvancedDemo from './useWebSocketAdvanced'
import UseNetworkStateDemo from './useNetworkState'
import UseUndoRedoDemo from './useUndoRedo'
import UseStateMachineDemo from './useStateMachine'
import UseLocalStorageSyncDemo from './useLocalStorageSync'
import UseIndexedDBDemo from './useIndexedDB'
import UseIntersectionObserverDemo from './useIntersectionObserver'
import UseRenderTrackerDemo from './useRenderTracker'
import UseIdleCallbackDemo from './useIdleCallback'
import UseVirtualizedListDemo from './useVirtualizedList'

const DEMO_TABS = [
    { id: 'query', label: '1. useQueryLite', component: UseQueryLiteDemo },
    { id: 'mutation', label: '2. useMutationLite', component: UseMutationLiteDemo },
    { id: 'websocket', label: '3. useWebSocketAdvanced', component: UseWebSocketAdvancedDemo },
    { id: 'network', label: '4. useNetworkState', component: UseNetworkStateDemo },
    { id: 'undo', label: '5. useUndoRedo', component: UseUndoRedoDemo },
    { id: 'statemachine', label: '6. useStateMachine', component: UseStateMachineDemo },
    { id: 'localstorage', label: '7. useLocalStorageSync', component: UseLocalStorageSyncDemo },
    { id: 'indexeddb', label: '8. useIndexedDB', component: UseIndexedDBDemo },
    { id: 'intersection', label: '9. useIntersectionObserver', component: UseIntersectionObserverDemo },
    { id: 'rendertracker', label: '10. useRenderTracker', component: UseRenderTrackerDemo },
    { id: 'idle', label: '11. useIdleCallback', component: UseIdleCallbackDemo },
    { id: 'virtualized', label: '12. useVirtualizedList', component: UseVirtualizedListDemo },
]

export function DemoApp() {
    const [activeTab, setActiveTab] = useState('query')

    const ActiveComponent = DEMO_TABS.find(tab => tab.id === activeTab)?.component || UseQueryLiteDemo

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>🎣 React Hooks Library - 12 Hooks Demo</h1>
                <p style={styles.subtitle}>
                    Production-grade hooks for data fetching, real-time, state, storage & performance
                </p>
            </header>

            <div style={styles.tabContainer}>
                <div style={styles.tabList}>
                    {DEMO_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={styles.content}>
                <ActiveComponent />
            </div>

            <footer style={styles.footer}>
                <p>
                    💡 Tip: Open browser DevTools to see console logs and network activity
                </p>
                <p>
                    📚 Documentation: Check out the comprehensive guides in the documentation folder
                </p>
            </footer>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    } as React.CSSProperties,
    header: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center' as const,
        borderBottom: '4px solid #3498db',
    } as React.CSSProperties,
    subtitle: {
        fontSize: '16px',
        opacity: 0.9,
        margin: '10px 0 0 0',
    } as React.CSSProperties,
    tabContainer: {
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        overflowX: 'auto' as const,
        position: 'sticky' as const,
        top: 0,
        zIndex: 10,
    } as React.CSSProperties,
    tabList: {
        display: 'flex',
        gap: '5px',
        padding: '10px',
        maxWidth: '1400px',
        margin: '0 auto',
        overflowX: 'auto' as const,
    } as React.CSSProperties,
    tab: {
        padding: '10px 16px',
        border: 'none',
        background: '#f0f0f0',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: 500,
        whiteSpace: 'nowrap' as const,
        transition: 'all 0.2s',
    } as React.CSSProperties,
    tabActive: {
        backgroundColor: '#3498db',
        color: 'white',
    } as React.CSSProperties,
    tabInactive: {
        color: '#333',
    } as React.CSSProperties,
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
    } as React.CSSProperties,
    footer: {
        backgroundColor: '#ecf0f1',
        padding: '20px',
        textAlign: 'center' as const,
        color: '#555',
        fontSize: '14px',
        borderTop: '1px solid #ddd',
    } as React.CSSProperties,
}

export default DemoApp