import React, { useState } from 'react'
import { useQueryLite, invalidateQuery } from '../../packages/core/src';

interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'user'
    avatar: string
}

/**
 * DEMO 1: useQueryLite
 * 
 * Real-World: User List with Search, Sort, and Caching
 * 
 * This demo shows:
 * - Data fetching with automatic caching
 * - Search and sort with cache key changes
 * - Loading, error, and success states
 * - Manual refetch and cache invalidation
 * - Stale state detection
 */
export function UseQueryLiteDemo() {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name')

    const { data: users, isLoading, error, isStale, refetch } = useQueryLite<User[]>(
        ['users', searchTerm, sortBy],
        async (signal) => {

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 800))

            if (Math.random() > 0.95) {
                throw new Error('Random API error - try again!')
            }

            const mockUsers: User[] = [
                { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', avatar: '👩' },
                { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', avatar: '👨' },
                { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user', avatar: '👩' },
                { id: 4, name: 'David Brown', email: 'david@example.com', role: 'admin', avatar: '👨' },
                { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'user', avatar: '👩' },
            ]

            let filtered = mockUsers

            if (searchTerm) {
                filtered = filtered.filter(
                    (u) =>
                        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
            }

            filtered.sort((a, b) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name)
                if (sortBy === 'email') return a.email.localeCompare(b.email)
                return a.role.localeCompare(b.role)
            })

            return filtered
        },
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retries: 2,
            retryDelay: 1000,
        }
    )

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>📂 Hook: useQueryLite</h2>
                <p style={styles.description}>
                    Smart data fetching with automatic caching, deduplication, and retry logic
                </p>

                <div style={styles.statusBox}>
                    <div>
                        <strong>Status:</strong> {isLoading ? '⏳ Loading' : error ? '❌ Error' : '✅ Success'}
                    </div>
                    <div>
                        <strong>Cache:</strong> {isStale ? '🔄 Stale' : '✓ Fresh'} | {users?.length || 0} items
                    </div>
                </div>

                <div style={styles.controlsGrid}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.input}
                    />

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={styles.select}>
                        <option value="name">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                        <option value="role">Sort by Role</option>
                    </select>

                    <button onClick={() => refetch()} style={{ ...styles.button, backgroundColor: '#27ae60' }}>
                        🔄 Refetch
                    </button>

                    <button
                        onClick={() => invalidateQuery(['users'])}
                        style={{ ...styles.button, backgroundColor: '#e74c3c' }}
                    >
                        🗑️ Clear Cache
                    </button>
                </div>

                {isLoading && <div style={styles.loading}>⏳ Loading users...</div>}

                {error && (
                    <div style={styles.error}>
                        ❌ Error: {error.message}
                        <button onClick={() => refetch()} style={styles.retryButton}>
                            Retry
                        </button>
                    </div>
                )}

                {users && users.length > 0 && (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={styles.tableRow}>
                                    <td>{user.avatar}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: user.role === 'admin' ? '#e74c3c' : '#3498db',
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {users && users.length === 0 && (
                    <div style={styles.empty}>No users found matching "{searchTerm}"</div>
                )}

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>Automatic caching - switch search/sort to see cache hits</li>
                        <li>Request deduplication - same request returns cached result</li>
                        <li>Stale-while-revalidate - marks data as stale after 5 min</li>
                        <li>Auto-retry - retries failed requests with backoff</li>
                        <li>Manual refetch - force refresh even if cached</li>
                        <li>Query invalidation - clear cache for specific queries</li>
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
    statusBox: {
        backgroundColor: '#ecf0f1',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        display: 'flex',
        gap: '20px',
    } as React.CSSProperties,
    controlsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px',
    } as React.CSSProperties,
    input: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
    } as React.CSSProperties,
    select: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    button: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    loading: {
        padding: '20px',
        textAlign: 'center' as const,
        color: '#666',
    } as React.CSSProperties,
    error: {
        padding: '15px',
        backgroundColor: '#fadbd8',
        color: '#c0392b',
        borderRadius: '4px',
        marginBottom: '15px',
    } as React.CSSProperties,
    retryButton: {
        marginLeft: '10px',
        padding: '4px 12px',
        backgroundColor: '#c0392b',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
    } as React.CSSProperties,
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginBottom: '20px',
    } as React.CSSProperties,
    tableHeader: {
        backgroundColor: '#34495e',
        color: 'white',
        fontWeight: 'bold',
    } as React.CSSProperties,
    tableRow: {
        borderBottom: '1px solid #ddd',
    } as React.CSSProperties,
    badge: {
        padding: '4px 8px',
        borderRadius: '3px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    empty: {
        padding: '20px',
        textAlign: 'center' as const,
        color: '#999',
    } as React.CSSProperties,
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '20px',
    } as React.CSSProperties,
    list: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
}

export default UseQueryLiteDemo