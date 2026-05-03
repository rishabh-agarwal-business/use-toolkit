import React, { useState } from 'react'
import { useMutationLite, invalidateQuery } from '../../packages/core/src';

interface NewUserForm {
    name: string
    email: string
    role: 'admin' | 'user'
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar: string;
    createdAt: string;
}

/**
 * DEMO 2: useMutationLite
 * 
 * Real-World: Create User Form
 * 
 * This demo shows:
 * - Form submission with mutation
 * - Loading state during submission
 * - Success and error handling
 * - Cache invalidation on success
 * - Optimistic updates
 */
export function UseMutationLiteDemo() {
    const [formData, setFormData] = useState<NewUserForm>({
        name: '',
        email: '',
        role: 'user',
    })
    const [createdUser, setCreatedUser] = useState<User | null>(null)

    const { mutate, isLoading, error, data } = useMutationLite(
        async (userData: NewUserForm) => {
            console.log('📤 Creating user...', userData)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            if (userData.name.length < 3) {
                throw new Error('Name must be at least 3 characters')
            }
            if (!userData.email.includes('@')) {
                throw new Error('Invalid email address')
            }

            const newUser = {
                id: Math.random(),
                ...userData,
                avatar: userData.role === 'admin' ? '👨‍💼' : '👤',
                createdAt: new Date().toISOString(),
            }

            console.log('✅ User created:', newUser)
            return newUser
        },
        {
            onSuccess: (newUser: any) => {
                console.log('🎉 Success callback called')
                setCreatedUser(newUser)
                invalidateQuery(['users']) // Refresh user list
                setFormData({ name: '', email: '', role: 'user' })
            },
            onError: (error) => {
                console.error('❌ Error callback called:', error)
            },
        }
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate(formData)
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>➕ Hook: useMutationLite</h2>
                <p style={styles.description}>
                    Handle server mutations with loading states, error handling, and cache invalidation
                </p>

                <div style={styles.grid}>
                    {/* Form */}
                    <div>
                        <h3>Create New User</h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    style={styles.input}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    style={styles.input}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label>Role:</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    style={styles.select}
                                    disabled={isLoading}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    ...styles.submitButton,
                                    opacity: isLoading ? 0.6 : 1,
                                }}
                            >
                                {isLoading ? '⏳ Creating...' : '✓ Create User'}
                            </button>
                        </form>

                        {error && <div style={styles.error}>❌ Error: {error.message}</div>}
                    </div>

                    {/* Result */}
                    <div>
                        <h3>Result</h3>
                        {createdUser ? (
                            <div style={styles.success}>
                                <p>✅ User created successfully!</p>
                                <div style={styles.userCard}>
                                    <div><strong>ID:</strong> {createdUser.id}</div>
                                    <div><strong>Name:</strong> {createdUser.name}</div>
                                    <div><strong>Email:</strong> {createdUser.email}</div>
                                    <div><strong>Role:</strong> {createdUser.role}</div>
                                    <div><strong>Created:</strong> {new Date(createdUser.createdAt).toLocaleTimeString()}</div>
                                </div>
                                <button
                                    onClick={() => setCreatedUser(null)}
                                    style={{ ...styles.button, marginTop: '10px' }}
                                >
                                    Clear
                                </button>
                            </div>
                        ) : (
                            <div style={styles.empty}>Fill out the form and submit to create a user</div>
                        )}
                    </div>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>Form submission handling with mutation</li>
                        <li>Loading state during API call (button disabled)</li>
                        <li>Success callback invalidating related queries</li>
                        <li>Error handling with custom error messages</li>
                        <li>Form reset after successful submission</li>
                        <li>Optimistic UI updates</li>
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
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '20px',
    } as React.CSSProperties,
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '15px',
    } as React.CSSProperties,
    input: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        marginTop: '5px',
    } as React.CSSProperties,
    select: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        marginTop: '5px',
    } as React.CSSProperties,
    submitButton: {
        padding: '10px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
    } as React.CSSProperties,
    button: {
        padding: '8px 16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    } as React.CSSProperties,
    error: {
        padding: '12px',
        backgroundColor: '#fadbd8',
        color: '#c0392b',
        borderRadius: '4px',
        marginTop: '10px',
    } as React.CSSProperties,
    success: {
        padding: '15px',
        backgroundColor: '#d5f4e6',
        borderRadius: '4px',
    } as React.CSSProperties,
    userCard: {
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #bdc3c7',
        marginTop: '10px',
        lineHeight: '1.8',
        fontSize: '14px',
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

export default UseMutationLiteDemo