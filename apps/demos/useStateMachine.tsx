import React from 'react'
import { StateMachineConfig, useStateMachine } from '../../packages/core/src'

/**
 * DEMO 6: useStateMachine
 * Real-World: Order Processing Workflow
 * Shows: State transitions, valid actions, guard conditions
 */

const orderConfig: StateMachineConfig<string, string> = {
    initial: 'pending',
    transitions: {
        pending: { CHECKOUT: 'processing', CANCEL: 'cancelled' },
        processing: { SUCCESS: 'confirmed', FAIL: 'failed' },
        confirmed: { SHIP: 'shipped', CANCEL: 'cancelled' },
        shipped: { DELIVER: 'delivered', RETURN: 'returned' },
        delivered: { RETURN: 'returned' },
        failed: { RETRY: 'processing', CANCEL: 'cancelled' },
        returned: { REFUND: 'refunded' },
        cancelled: { RETRY: 'processing', CANCEL: 'cancelled' },
        refunded: {},
    },
};


export function UseStateMachineDemo() {
    const { state, send } = useStateMachine(orderConfig);

    const stateEmojis = {
        pending: '⏳',
        processing: '💳',
        confirmed: '✅',
        shipped: '📦',
        delivered: '🏠',
        failed: '❌',
        returned: '↩️',
        cancelled: '🚫',
        refunded: '💰',
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>🔄 Hook: useStateMachine</h2>
                <p style={styles.description}>
                    Finite State Machine with validated transitions
                </p>

                {/* Current State */}
                <div style={styles.stateBox}>
                    <div>{stateEmojis[state as keyof typeof stateEmojis]} {state.toUpperCase()}</div>
                </div>

                {/* Available Actions */}
                <div style={styles.actionsGrid}>
                    {Object.entries(
                        orderConfig.transitions[state as keyof typeof orderConfig.transitions] ?? {}
                    ).map(([action]) => (
                        <button
                            key={action}
                            onClick={() => send(action)}
                            style={styles.actionButton}
                        >
                            {action}
                        </button>
                    ))}
                </div>


                {/* Flow Diagram */}
                <div style={styles.flowSection}>
                    <h3>Order Flow</h3>
                    <p style={styles.flow}>
                        pending → processing → confirmed → shipped → delivered ← returned ← all states
                    </p>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features:</h4>
                    <ul style={styles.list}>
                        <li>Validated state transitions</li>
                        <li>Guard condition support</li>
                        <li>Only valid actions available</li>
                        <li>No invalid state possible</li>
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
    stateBox: {
        fontSize: '32px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center' as const,
        marginBottom: '20px',
    } as React.CSSProperties,
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px',
        marginBottom: '20px',
    } as React.CSSProperties,
    actionButton: {
        padding: '10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    } as React.CSSProperties,
    flowSection: {
        backgroundColor: '#ecf0f1',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
    } as React.CSSProperties,
    flow: {
        fontFamily: 'monospace',
        fontSize: '12px',
        margin: 0,
    } as React.CSSProperties,
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
    } as React.CSSProperties,
    list: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
}

export default UseStateMachineDemo