import React, { useState, useMemo } from 'react'
import { useVirtualizedList } from '../../packages/core/src'

interface ListItem {
    id: number
    name: string
    email: string
    status: 'active' | 'inactive' | 'pending'
    joinDate: string
}

/**
 * DEMO 12: useVirtualizedList
 * 
 * Real-World: Virtual Scrolling for Large Lists
 * 
 * This demo shows:
 * - Render only visible items
 * - Handle 10,000+ items smoothly
 * - Virtual scrolling with fixed heights
 * - Performance optimization
 * - Smooth 60 FPS scrolling
 */
export function UseVirtualizedListDemo() {
    const [itemCount, setItemCount] = useState(1000)
    const [searchTerm, setSearchTerm] = useState('')

    // Generate mock data
    const items: ListItem[] = useMemo(
        () =>
            Array.from({ length: itemCount }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                status: ['active', 'inactive', 'pending'][i % 3] as any,
                joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            })),
        [itemCount]
    )

    // Filter items
    const filteredItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [items, searchTerm]
    )

    // Use virtualization
    const { visibleItems, containerStyle, offsetY } = useVirtualizedList(
        filteredItems,
        {
            containerHeight: 500,
            itemHeight: "auto",
            overscan: 50000,
        }
    )

    const statusColors = {
        active: '#27ae60',
        inactive: '#95a5a6',
        pending: '#f39c12',
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>📜 Hook: useVirtualizedList</h2>
                <p style={styles.description}>
                    Efficiently render large lists (10,000+ items) with virtual scrolling
                </p>

                {/* Stats */}
                <div style={styles.statsBox}>
                    <div>
                        <strong>📊 Total Items:</strong> {items.length.toLocaleString()}
                    </div>
                    <div>
                        <strong>🔍 Filtered:</strong> {filteredItems.length.toLocaleString()}
                    </div>
                    <div>
                        <strong>📺 Visible:</strong> {visibleItems.length}
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controlsSection}>
                    <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        value={itemCount}
                        onChange={(e) => setItemCount(parseInt(e.target.value))}
                        style={styles.slider}
                        title="Adjust number of items"
                    />
                    <label style={styles.sliderLabel}>
                        Items: {itemCount.toLocaleString()}
                    </label>

                    <input
                        type="text"
                        placeholder="🔍 Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                {/* Virtual List */}
                <div style={containerStyle} >
                    <div style={{ transform: `translateY(${offsetY}px)`, overflowY: 'scroll' }}>
                        {visibleItems.map((item) => (
                            <div key={item.id} style={{ ...styles.listItem }}>
                                <div style={styles.itemContent}>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <div style={styles.email}>{item.email}</div>
                                    </div>
                                    <div style={styles.itemRight}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: statusColors[item.status],
                                        }}>
                                            {item.status}
                                        </span>
                                        <span style={styles.date}>{item.joinDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>✅ Virtual scrolling - render only visible items</li>
                        <li>✅ Handle 10,000+ items smoothly</li>
                        <li>✅ 60 FPS performance</li>
                        <li>✅ Dynamic item filtering</li>
                        <li>✅ Fixed item heights</li>
                        <li>✅ Overscan for smooth scrolling</li>
                        <li>✅ Memory efficient - only DOM nodes for visible items</li>
                    </ul>
                </div>

                <div style={styles.tipsBox}>
                    <h4>⚡ Performance Tips:</h4>
                    <ul style={styles.list}>
                        <li>Try adjusting the slider to test with different list sizes</li>
                        <li>Use search to filter the list and see dynamic resizing</li>
                        <li>Scroll smoothly - only visible items are rendered!</li>
                        <li>Without virtualization, 10,000 items would be slow or crash</li>
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
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '13px',
    } as React.CSSProperties,
    controlsSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
    } as React.CSSProperties,
    slider: {
        width: '100%',
    } as React.CSSProperties,
    sliderLabel: {
        fontSize: '13px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    searchInput: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    listItem: {
        height: '50px',
        borderBottom: '1px solid #ecf0f1',
        display: 'flex',
        alignItems: 'center',
    } as React.CSSProperties,
    itemContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '0 12px',
    } as React.CSSProperties,
    email: {
        fontSize: '12px',
        color: '#999',
        marginTop: '2px',
    } as React.CSSProperties,
    itemRight: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    } as React.CSSProperties,
    statusBadge: {
        padding: '3px 8px',
        borderRadius: '3px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    date: {
        fontSize: '12px',
        color: '#999',
    } as React.CSSProperties,
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '20px',
        marginBottom: '15px',
    } as React.CSSProperties,
    tipsBox: {
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '4px',
    } as React.CSSProperties,
    list: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
}

export default UseVirtualizedListDemo