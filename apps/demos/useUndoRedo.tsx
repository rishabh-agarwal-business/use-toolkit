import React from 'react'
import { useUndoRedo } from '../../packages/core/src'

/**
 * DEMO 5: useUndoRedo
 * 
 * Real-World: Text Editor with History
 * 
 * This demo shows:
 * - State history tracking
 * - Undo/redo functionality
 * - History navigation
 * - Can undo/redo indicators
 */
export function UseUndoRedoDemo() {
    const {
        state: text,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        history,
    } = useUndoRedo('Write something here...');

    const handleClear = () => {
        setState('')
    }

    const handleUppercase = () => {
        setState(text.toUpperCase())
    }

    const handleLowercase = () => {
        setState(text.toLowerCase())
    }

    const handleReverse = () => {
        setState(text.split('').reverse().join(''))
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>↩️ Hook: useUndoRedo</h2>
                <p style={styles.description}>
                    Track state changes and navigate through history with undo/redo
                </p>

                {/* History Info */}
                <div style={styles.historyInfo}>
                    <div>
                        <strong>Changes:</strong> {history.past.length}
                    </div>
                    <div>
                        <strong>Can Undo:</strong> {canUndo ? '✓ Yes' : '✗ No'}
                    </div>
                    <div>
                        <strong>Can Redo:</strong> {canRedo ? '✓ Yes' : '✗ No'}
                    </div>
                    <div>
                        <strong>Length:</strong> {text.length} chars
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controls}>
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        style={{ ...styles.button, opacity: canUndo ? 1 : 0.5 }}
                    >
                        ↶ Undo
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        style={{ ...styles.button, opacity: canRedo ? 1 : 0.5 }}
                    >
                        ↷ Redo
                    </button>
                    <button onClick={handleUppercase} style={styles.button}>
                        ABC Uppercase
                    </button>
                    <button onClick={handleLowercase} style={styles.button}>
                        abc Lowercase
                    </button>
                    <button onClick={handleReverse} style={styles.button}>
                        🔄 Reverse
                    </button>
                    <button onClick={handleClear} style={{ ...styles.button, backgroundColor: '#e74c3c' }}>
                        🗑️ Clear
                    </button>
                </div>

                {/* Editor */}
                <textarea
                    value={text}
                    onChange={(e) => setState(e.target.value)}
                    style={styles.editor}
                    placeholder="Type or use buttons to modify text..."
                />

                {/* History Timeline */}
                <div style={styles.section}>
                    <h3>History Timeline</h3>
                    <div style={styles.timeline}>
                        {history.past.length === 0 ? (
                            <div style={styles.emptyTimeline}>No history yet</div>
                        ) : (
                            <div style={styles.historyList}>
                                <div style={{ ...styles.historyList, opacity: 0.5 }}>
                                    {history.past.map((item, idx) => (
                                        <div key={idx} style={styles.historyEntry}>
                                            • Step {idx + 1}: "{item?.slice(0, 30)}{item.length > 30 ? '...' : ''}"
                                        </div>
                                    ))}
                                </div>
                                <div style={styles.historyDivider}>Current ← →</div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>Text state tracking with history</li>
                        <li>Undo/redo navigation</li>
                        <li>History size limiting (maxHistorySize: 50)</li>
                        <li>canUndo/canRedo indicators</li>
                        <li>Multiple ways to modify state</li>
                        <li>Full history visibility</li>
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
    description: { color: '#666', marginBottom: '15px' } as React.CSSProperties,
    historyInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        backgroundColor: '#ecf0f1',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
    } as React.CSSProperties,
    controls: {
        display: 'flex',
        gap: '8px',
        marginBottom: '15px',
        flexWrap: 'wrap' as const,
    } as React.CSSProperties,
    button: {
        padding: '8px 12px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    editor: {
        width: '100%',
        height: '200px',
        padding: '12px',
        borderRadius: '4px',
        border: '2px solid #bdc3c7',
        fontFamily: 'monospace',
        fontSize: '14px',
        resize: 'vertical' as const,
        marginBottom: '20px',
    } as React.CSSProperties,
    section: {
        marginTop: '20px',
    } as React.CSSProperties,
    timeline: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        border: '1px solid #e9ecef',
    } as React.CSSProperties,
    emptyTimeline: {
        textAlign: 'center' as const,
        color: '#999',
        padding: '20px',
    } as React.CSSProperties,
    historyList: {
        fontSize: '13px',
        lineHeight: '1.6',
    } as React.CSSProperties,
    historyEntry: {
        padding: '4px 0',
        borderBottom: '1px solid #ecf0f1',
    } as React.CSSProperties,
    historyDivider: {
        textAlign: 'center' as const,
        padding: '8px 0',
        fontWeight: 'bold',
        color: '#3498db',
    } as React.CSSProperties,
    list: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '20px',
    } as React.CSSProperties,
}

export default UseUndoRedoDemo