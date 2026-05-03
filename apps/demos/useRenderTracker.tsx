import React, { useState, useMemo } from 'react'
import { useRenderTracker } from '../../packages/core/src'

/**
 * DEMO 10: useRenderTracker
 * 
 * Real-World: Performance Debugging Tool
 * 
 * This demo shows:
 * - Render count tracking
 * - Excessive render detection
 * - Debug insights
 * - Performance optimization identification
 */
export function UseRenderTrackerDemo() {
    const [count, setCount] = useState(0)
    const [text, setText] = useState('')
    const [items, setItems] = useState<string[]>([])

    const tracker = useRenderTracker({
        name: 'RenderTrackerDemo',
        renderThreshold: 5, // Alert if renders > 5
    })

    // Inefficient: doesn't memoize
    const expensiveCalc = useMemo(() => {
        return Array.from({ length: 100 }, (_, i) => i * 2)
    }, [])

    const handleAddItem = () => {
        setItems(prev => [...prev, `Item ${prev.length + 1}`])
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>🔍 Hook: useRenderTracker</h2>
                <p style={styles.description}>
                    Detect excessive re-renders and optimize component performance
                </p>

                {/* Render Stats */}
                <div style={{
                    ...styles.statsBox,
                    backgroundColor: tracker.hasExcessiveRenders ? '#ffebee' : '#d5f4e6',
                }}>
                    <h3>📊 Render Statistics</h3>
                    <div style={styles.statsGrid}>
                        <div>
                            <strong>Render Count:</strong>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {tracker.renderCount}
                            </div>
                        </div>
                        <div>
                            <strong>Status:</strong>
                            <div style={{
                                fontSize: '16px',
                                color: tracker.hasExcessiveRenders ? '#c0392b' : '#27ae60',
                            }}>
                                {tracker.hasExcessiveRenders ? '⚠️ Excessive' : '✅ Optimal'}
                            </div>
                        </div>
                        <div>
                            <strong>Component:</strong>
                            <div style={{ fontSize: '14px' }}>{tracker.name}</div>
                        </div>
                    </div>
                </div>

                {/* Debug Info */}
                {tracker.renderReasons && tracker.renderReasons.length > 0 && (
                    <div style={styles.debugBox}>
                        <h4>🐛 Render Reasons</h4>
                        <ul style={styles.list}>
                            {tracker.renderReasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Controls to trigger re-renders */}
                <div style={styles.controlsSection}>
                    <h3>🎮 Trigger Re-renders</h3>

                    <div style={styles.controlsGrid}>
                        <div>
                            <label>Counter: {count}</label>
                            <button
                                onClick={() => setCount(count + 1)}
                                style={styles.button}
                            >
                                ➕ Increment
                            </button>
                        </div>

                        <div>
                            <label>Text Input</label>
                            <input
                                type="text"
                                placeholder="Type something..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div>
                            <label>Items: {items.length}</label>
                            <button
                                onClick={handleAddItem}
                                style={styles.button}
                            >
                                ➕ Add Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                    <div style={styles.itemsSection}>
                        <h4>Items List</h4>
                        <ul style={styles.itemsList}>
                            {items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Performance Tips */}
                <div style={styles.tipsBox}>
                    <h4>💡 Performance Optimization Tips</h4>
                    <ul style={styles.list}>
                        <li>✅ Use useMemo() to prevent unnecessary recalculations</li>
                        <li>✅ Use useCallback() to prevent function recreation</li>
                        <li>✅ Use React.memo() for child components</li>
                        <li>✅ Split state into multiple useState calls</li>
                        <li>✅ Use key prop correctly in lists</li>
                        <li>✅ Avoid creating objects/arrays in render</li>
                        <li>⚠️ Your component renders {tracker.renderCount} times!</li>
                        {tracker.hasExcessiveRenders && (
                            <li style={{ color: '#c0392b' }}>
                                🔴 This component has excessive re-renders - consider optimization!
                            </li>
                        )}
                    </ul>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>✅ Track component render count</li>
                        <li>✅ Detect excessive re-renders</li>
                        <li>✅ Identify render reasons</li>
                        <li>✅ Development debugging tool</li>
                        <li>✅ Performance insights</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: { padding: '20px' } as React.CSSProperties,
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    } as React.CSSProperties,
    description: { color: '#666', marginBottom: '20px' } as React.CSSProperties,
    statsBox: {
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    } as React.CSSProperties,
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginTop: '15px',
    } as React.CSSProperties,
    debugBox: {
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
    } as React.CSSProperties,
    controlsSection: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    } as React.CSSProperties,
    controlsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginTop: '10px',
    } as React.CSSProperties,
    input: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        marginTop: '5px',
    } as React.CSSProperties,
    button: {
        width: '100%',
        padding: '8px 12px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        marginTop: '5px',
    } as React.CSSProperties,
    itemsSection: {
        backgroundColor: '#ecf0f1',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
    } as React.CSSProperties,
    itemsList: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
    tipsBox: {
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
    } as React.CSSProperties,
    list: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
    } as React.CSSProperties,
}

export default UseRenderTrackerDemo