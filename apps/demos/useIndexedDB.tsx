import React, { useState, useEffect, useRef } from 'react'
import { useIndexedDB } from '../../packages/core/src/hooks/useIndexedDB'

interface Note {
    id: number
    title: string
    content: string
    category: 'personal' | 'work' | 'ideas'
    color: string
    createdAt: number
    updatedAt: number
    pinned: boolean
}

export function UseIndexedDBDemo() {
    const [notes, setNotes] = useState<Note[]>([])
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState<'personal' | 'work' | 'ideas'>('personal')
    const [color, setColor] = useState('#fff9c4')
    const [searchTerm, setSearchTerm] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Prevent multiple loads
    const loadingRef = useRef(false)

    const { put, getAll, delete: deleteNote, clear, isReady, error: dbError } = useIndexedDB<Note>(
        'NotesDB',
        {
            name: 'notes',
            keyPath: 'id',
            autoIncrement: true,
            indexes: [
                { name: 'category', keyPath: 'category' },
                { name: 'createdAt', keyPath: 'createdAt' },
                { name: 'pinned', keyPath: 'pinned' },
            ],
        }
    )

    // Load notes when database is ready
    useEffect(() => {
        if (!isReady || loadingRef.current) {
            return
        }

        loadingRef.current = true

        const loadNotes = async () => {
            try {
                setIsLoading(true)
                console.log('📚 Loading notes...')
                const allNotes = await getAll()
                console.log('✅ Loaded', allNotes.length, 'notes')
                setNotes(allNotes || [])
                setNotification(null)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load notes'
                console.error('❌ Error loading notes:', message)
                setNotification({ type: 'error', message })
            } finally {
                setIsLoading(false)
                loadingRef.current = false
            }
        }

        loadNotes()
    }, [isReady, getAll])

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const saveNote = async () => {
        if (!title.trim()) {
            showNotification('error', '⚠️ Title is required!')
            return
        }

        if (!content.trim()) {
            showNotification('error', '⚠️ Content is required!')
            return
        }

        if (!isReady) {
            showNotification('error', '⏳ Database not ready. Please wait...')
            return
        }

        setIsSaving(true)

        try {
            const now = Date.now()
            const newNote: Note = {
                id: editingId || now,
                title: title.trim(),
                content: content.trim(),
                category,
                color,
                createdAt: editingId ? notes.find((n) => n.id === editingId)?.createdAt || now : now,
                updatedAt: now,
                pinned: editingId ? notes.find((n) => n.id === editingId)?.pinned || false : false,
            }

            await put(newNote)
            console.log('✅ Note saved:', newNote.id)

            // Reset form
            setTitle('')
            setContent('')
            setCategory('personal')
            setColor('#fff9c4')
            setEditingId(null)

            // Reload notes
            const allNotes = await getAll()
            setNotes(allNotes || [])

            showNotification('success', `✅ ${editingId ? 'Updated' : 'Created'} note successfully`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save note'
            console.error('❌ Error saving note:', message)

            if (message.includes('quota')) {
                showNotification('error', '❌ Storage quota exceeded. Delete some notes.')
            } else {
                showNotification('error', `❌ ${message}`)
            }
        } finally {
            setIsSaving(false)
        }
    }

    const deleteNoteById = async (id: number) => {
        if (!window.confirm('🗑️ Delete this note? This action cannot be undone.')) {
            return
        }

        try {
            await deleteNote(id)
            console.log('✅ Note deleted:', id)

            // Reload notes
            const allNotes = await getAll()
            setNotes(allNotes || [])

            showNotification('success', '✅ Note deleted')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete note'
            console.error('❌ Error deleting note:', message)
            showNotification('error', `❌ ${message}`)
        }
    }

    const editNote = (note: Note) => {
        setTitle(note.title)
        setContent(note.content)
        setCategory(note.category)
        setColor(note.color)
        setEditingId(note.id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setTitle('')
        setContent('')
        setCategory('personal')
        setColor('#fff9c4')
        setEditingId(null)
    }

    const togglePin = async (id: number) => {
        const note = notes.find((n) => n.id === id)
        if (!note || !isReady) return

        try {
            await put({ ...note, pinned: !note.pinned })
            const allNotes = await getAll()
            setNotes(allNotes || [])
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to pin note'
            console.error('❌ Error pinning note:', message)
        }
    }

    const clearAllNotes = async () => {
        if (!window.confirm('🧹 Clear all notes? This cannot be undone.')) {
            return
        }

        try {
            await clear()
            setNotes([])
            setEditingId(null)
            setTitle('')
            setContent('')
            showNotification('success', '✅ All notes cleared')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to clear notes'
            console.error('❌ Error clearing notes:', message)
            showNotification('error', `❌ ${message}`)
        }
    }

    const filteredNotes = notes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const pinnedNotes = filteredNotes.filter((n) => n.pinned).sort((a, b) => b.updatedAt - a.updatedAt)
    const unpinnedNotes = filteredNotes.filter((n) => !n.pinned).sort((a, b) => b.updatedAt - a.updatedAt)

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>📓 Hook: useIndexedDB</h2>
                <p style={styles.description}>Store and manage large amounts of data locally with offline support</p>

                {/* Notification */}
                {notification && (
                    <div
                        style={{
                            ...styles.notification,
                            backgroundColor: notification.type === 'success' ? '#d5f4e6' : '#f8d7da',
                            color: notification.type === 'success' ? '#155724' : '#721c24',
                        }}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Status */}
                <div style={styles.statusBox}>
                    <div>
                        <strong>Status:</strong> {isReady ? '✅ Ready' : '⏳ Initializing...'}
                    </div>
                    <div>
                        <strong>Notes:</strong> {notes.length}
                    </div>
                    <div>
                        <strong>Pinned:</strong> {notes.filter((n) => n.pinned).length}
                    </div>
                </div>

                {/* DB Error */}
                {dbError && (
                    <div style={styles.errorBox}>
                        <strong>❌ Database Error:</strong> {dbError.message}
                    </div>
                )}

                {isLoading ? (
                    <div style={styles.loading}>⏳ Initializing database...</div>
                ) : (
                    <>
                        {/* Form */}
                        <div style={styles.formSection}>
                            <h3>{editingId ? '✏️ Edit Note' : '✨ Create New Note'}</h3>

                            <div style={styles.formGrid}>
                                <input
                                    type="text"
                                    placeholder="Note title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    style={styles.input}
                                    disabled={isSaving}
                                />

                                <div style={styles.categoryColorRow}>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        style={styles.select}
                                        disabled={isSaving}
                                    >
                                        <option value="personal">📌 Personal</option>
                                        <option value="work">💼 Work</option>
                                        <option value="ideas">💡 Ideas</option>
                                    </select>

                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        style={styles.colorPicker}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <textarea
                                placeholder="Write your note here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={styles.textarea}
                                disabled={isSaving}
                            />

                            <div style={styles.formActions}>
                                <button
                                    onClick={saveNote}
                                    disabled={isSaving || !isReady}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: isSaving || !isReady ? '#95a5a6' : '#27ae60',
                                    }}
                                >
                                    {isSaving ? '⏳ Saving...' : editingId ? '💾 Update' : '➕ Create'}
                                </button>
                                {editingId && (
                                    <button
                                        onClick={cancelEdit}
                                        disabled={isSaving}
                                        style={{ ...styles.button, backgroundColor: '#95a5a6' }}
                                    >
                                        ❌ Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        <div style={styles.searchSection}>
                            <input
                                type="text"
                                placeholder="🔍 Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            <div style={styles.statsRow}>
                                <span>
                                    📊 Total: {notes.length} | 📌 Pinned: {pinnedNotes.length} | Found: {filteredNotes.length}
                                </span>
                            </div>
                        </div>

                        {/* Pinned Notes */}
                        {pinnedNotes.length > 0 && (
                            <>
                                <h3 style={styles.sectionTitle}>📌 Pinned Notes ({pinnedNotes.length})</h3>
                                <div style={styles.notesGrid}>
                                    {pinnedNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onEdit={editNote}
                                            onDelete={deleteNoteById}
                                            onTogglePin={togglePin}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Unpinned Notes */}
                        {unpinnedNotes.length > 0 && (
                            <>
                                <h3 style={styles.sectionTitle}>📝 Notes ({unpinnedNotes.length})</h3>
                                <div style={styles.notesGrid}>
                                    {unpinnedNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onEdit={editNote}
                                            onDelete={deleteNoteById}
                                            onTogglePin={togglePin}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Empty States */}
                        {filteredNotes.length === 0 && notes.length > 0 && (
                            <div style={styles.empty}>
                                No notes match "{searchTerm}". Try a different search!
                            </div>
                        )}

                        {notes.length === 0 && (
                            <div style={styles.empty}>📭 No notes yet. Create your first note above!</div>
                        )}

                        {/* Actions */}
                        {notes.length > 0 && (
                            <div style={styles.actions}>
                                <button onClick={clearAllNotes} style={{ ...styles.button, backgroundColor: '#e74c3c' }}>
                                    🧹 Clear All Notes
                                </button>
                            </div>
                        )}
                    </>
                )}

                <div style={styles.infoBox}>
                    <h4>💡 Key Features:</h4>
                    <ul style={styles.list}>
                        <li>✅ Automatic database initialization</li>
                        <li>✅ Wait for ready state before operations</li>
                        <li>✅ Full CRUD operations (Create, Read, Update, Delete)</li>
                        <li>✅ Offline-first capability</li>
                        <li>✅ Indexed queries by category, date, pinned status</li>
                        <li>✅ Quota exceeded error handling</li>
                        <li>✅ Real-time notifications</li>
                        <li>✅ No data loss on page refresh</li>
                    </ul>
                </div>

                <div style={styles.tipsBox}>
                    <h4>💻 Tips:</h4>
                    <ul style={styles.list}>
                        <li>Open DevTools Console to see detailed logs</li>
                        <li>Data persists across browser sessions</li>
                        <li>Each browser has separate storage (100MB+ quota)</li>
                        <li>Notes are sorted by most recent first</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

interface NoteCardProps {
    note: Note
    onEdit: (note: Note) => void
    onDelete: (id: number) => void
    onTogglePin: (id: number) => void
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
    return (
        <div
            style={{
                ...styles.noteCard,
                backgroundColor: note.color,
            }}
        >
            <div style={styles.noteHeader}>
                <h4 style={{ margin: 0 }}>{note.title}</h4>
                <button
                    onClick={() => onTogglePin(note.id)}
                    style={styles.iconButton}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                >
                    {note.pinned ? '📌' : '📍'}
                </button>
            </div>

            <p style={styles.noteContent}>{note.content.slice(0, 100)}...</p>

            <div style={styles.noteFooter}>
                <span style={styles.noteCategory}>
                    {note.category === 'personal' ? '📌' : note.category === 'work' ? '💼' : '💡'} {note.category}
                </span>
                <span style={styles.noteDate}>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>

            <div style={styles.noteActions}>
                <button onClick={() => onEdit(note)} style={styles.actionButton}>
                    ✏️ Edit
                </button>
                <button onClick={() => onDelete(note.id)} style={{ ...styles.actionButton, backgroundColor: '#e74c3c' }}>
                    🗑️ Delete
                </button>
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
    notification: {
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontWeight: 'bold',
        animation: 'slideIn 0.3s ease-in',
    } as React.CSSProperties,
    statusBox: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        backgroundColor: '#ecf0f1',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
    } as React.CSSProperties,
    errorBox: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
    } as React.CSSProperties,
    loading: { textAlign: 'center' as const, padding: '60px 20px', color: '#999', fontSize: '16px' },
    formSection: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    } as React.CSSProperties,
    formGrid: { display: 'grid' as const, gap: '10px', marginBottom: '10px' },
    input: {
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    categoryColorRow: { display: 'flex' as const, gap: '10px' },
    select: {
        flex: 1,
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    colorPicker: {
        width: '50px',
        height: '40px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
    } as React.CSSProperties,
    textarea: {
        width: '100%',
        height: '120px',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: 'inherit',
        marginBottom: '10px',
        resize: 'vertical' as const,
    } as React.CSSProperties,
    formActions: { display: 'flex' as const, gap: '10px' },
    button: {
        flex: 1,
        padding: '10px 16px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    } as React.CSSProperties,
    searchSection: { marginBottom: '20px' },
    searchInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    statsRow: { marginTop: '8px', fontSize: '12px', color: '#666' },
    sectionTitle: { marginTop: '20px', marginBottom: '15px', color: '#333', fontSize: '16px' },
    notesGrid: {
        display: 'grid' as const,
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
    } as React.CSSProperties,
    noteCard: {
        borderRadius: '8px',
        padding: '15px',
        border: '2px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    } as React.CSSProperties,
    noteHeader: { display: 'flex' as const, justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' },
    iconButton: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '0' } as React.CSSProperties,
    noteContent: { margin: '10px 0', color: '#333', lineHeight: '1.4', fontSize: '13px' },
    noteFooter: { display: 'flex' as const, justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '10px' },
    noteCategory: { display: 'inline-block', padding: '2px 6px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '3px' },
    noteDate: { display: 'inline-block' },
    noteActions: { display: 'flex' as const, gap: '8px' },
    actionButton: {
        flex: 1,
        padding: '6px 8px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    actions: { display: 'flex' as const, gap: '10px', marginBottom: '20px' },
    empty: { textAlign: 'center' as const, padding: '40px 20px', color: '#999', fontSize: '14px' },
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '15px',
    } as React.CSSProperties,
    tipsBox: {
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '4px',
    } as React.CSSProperties,
    list: { marginLeft: '20px', lineHeight: '1.8', fontSize: '13px' },
}

export default UseIndexedDBDemo