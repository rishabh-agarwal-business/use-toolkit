import React from 'react'
import { useNetworkState } from '../../packages/core/src'

/**
 * DEMO 4: useNetworkState
 * 
 * Real-World: Network Status Monitor
 * 
 * This demo shows:
 * - Online/offline detection
 * - Connection type detection (4G, 3G, 2G, etc)
 * - RTT (Round Trip Time) measurement
 * - Save-data preference detection
 * - Connection quality assessment
 */
export function UseNetworkStateDemo() {
    const {
        online,
        effectiveType,
        rtt,
        saveData,
        isSlow,
        isUnstable,
    } = useNetworkState()

    const getConnectionColor = (type: string) => {
        if (isSlow) return '#e74c3c'
        if (isUnstable) return '#f39c12'
        switch (type) {
            case '4g': return '#27ae60'
            case '3g': return '#f39c12'
            case '2g': return '#e74c3c'
            default: return '#95a5a6'
        }
    }

    const getQualityStatus = () => {
        if (!online) return { emoji: '❌', text: 'Offline', color: '#e74c3c' }
        if (isSlow) return { emoji: '🐢', text: 'Slow (Degraded)', color: '#e74c3c' }
        if (isUnstable) return { emoji: '⚠️', text: 'Unstable', color: '#f39c12' }
        return { emoji: '✅', text: 'Good', color: '#27ae60' }
    }

    const quality = getQualityStatus()

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>📡 Hook: useNetworkState</h2>
                <p style={styles.description}>
                    Monitor network quality and adapt your application accordingly
                </p>

                {/* Main Status */}
                <div style={{
                    ...styles.mainStatus,
                    backgroundColor: online ? '#d5f4e6' : '#fadbd8',
                }}>
                    <div style={styles.statusEmoji}>{online ? '🟢' : '🔴'}</div>
                    <div>
                        <h3>{online ? 'Online' : 'Offline'}</h3>
                        <p>{online ? 'Internet connection available' : 'No internet connection'}</p>
                    </div>
                </div>

                {/* Quality Grid */}
                <div style={styles.grid}>
                    {/* Connection Type */}
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>Connection Type</div>
                        <div style={{
                            ...styles.statValue,
                            color: getConnectionColor(effectiveType || ''),
                        }}>
                            {effectiveType?.toUpperCase() || 'UNKNOWN'}
                        </div>
                        <div style={styles.statDescription}>Network technology</div>
                    </div>

                    {/* RTT */}
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>Latency (RTT)</div>
                        <div style={styles.statValue}>{rtt}ms</div>
                        <div style={styles.statDescription}>Round-trip time</div>
                    </div>

                    {/* Quality Status */}
                    <div style={{
                        ...styles.statBox,
                        backgroundColor: quality.color + '20',
                        borderColor: quality.color,
                    }}>
                        <div style={styles.statLabel}>Quality</div>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>{quality.emoji}</div>
                        <div style={{ ...styles.statValue, color: quality.color }}>
                            {quality.text}
                        </div>
                    </div>

                    {/* Save-Data */}
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>Data Saver</div>
                        <div style={styles.statValue}>{saveData ? 'ON' : 'OFF'}</div>
                        <div style={styles.statDescription}>User preference</div>
                    </div>
                </div>

                {/* Quality Bars */}
                <div style={styles.section}>
                    <h3>Connection Quality Indicators</h3>
                    <div style={styles.indicators}>
                        <div>
                            <div style={styles.indicatorLabel}>
                                Speed: {isSlow ? '🐢 Slow' : '✓ Fast'}
                            </div>
                            <div style={{
                                ...styles.indicatorBar,
                                backgroundColor: isSlow ? '#e74c3c' : '#27ae60',
                            }} />
                        </div>
                        <div>
                            <div style={styles.indicatorLabel}>
                                Stability: {isUnstable ? '⚠️ Unstable' : '✓ Stable'}
                            </div>
                            <div style={{
                                ...styles.indicatorBar,
                                backgroundColor: isUnstable ? '#f39c12' : '#27ae60',
                            }} />
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div style={styles.section}>
                    <h3>🎯 Recommendations</h3>
                    <ul style={styles.list}>
                        {!online && <li>❌ Offline mode - Queue operations for later</li>}
                        {isSlow && <li>🐢 Load low-quality images and disable video</li>}
                        {isUnstable && <li>⚠️ Show connection status and retry logic</li>}
                        {saveData && <li>💾 User enabled data saver - Reduce bandwidth</li>}
                        {rtt && rtt > 100 ? <li>⏱️ High latency - Show progress indicators</li> : null}
                        {online && !isSlow && !isUnstable && <li>✅ Good connection - Load full quality</li>}
                    </ul>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>Online/offline detection with event listeners</li>
                        <li>Connection type detection (4G, 3G, 2G, slow-2g)</li>
                        <li>RTT measurement for latency assessment</li>
                        <li>Save-data user preference detection</li>
                        <li>Quality assessment (slow, unstable detection)</li>
                        <li>Real-time updates on connection changes</li>
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
    mainStatus: {
        display: 'flex',
        gap: '15px',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    } as React.CSSProperties,
    statusEmoji: {
        fontSize: '32px',
    } as React.CSSProperties,
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
    } as React.CSSProperties,
    statBox: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
    } as React.CSSProperties,
    statLabel: {
        fontSize: '12px',
        color: '#666',
        fontWeight: 'bold',
        marginBottom: '5px',
    } as React.CSSProperties,
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '5px',
    } as React.CSSProperties,
    statDescription: {
        fontSize: '12px',
        color: '#999',
    } as React.CSSProperties,
    section: {
        marginBottom: '20px',
    } as React.CSSProperties,
    indicators: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '15px',
    } as React.CSSProperties,
    indicatorLabel: {
        fontSize: '13px',
        fontWeight: 'bold',
        marginBottom: '5px',
    } as React.CSSProperties,
    indicatorBar: {
        height: '6px',
        borderRadius: '3px',
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

export default UseNetworkStateDemo