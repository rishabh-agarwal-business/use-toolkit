import React, { useState, useCallback } from 'react'
import { useIdleCallback } from '../../packages/core/src/hooks/useIdleCallback'

interface BackgroundTask {
    id: number
    name: string
    status: 'pending' | 'running' | 'completed' | 'cancelled'
    progress: number
    startTime: number
    endTime?: number
}

export function UseIdleCallbackDemo() {
    const [tasks, setTasks] = useState<BackgroundTask[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const taskScheduleMapRef = React.useRef<Map<number, () => void>>(new Map())

    const { scheduleTask, cancelTask, isSupported, pendingTaskCount } = useIdleCallback({
        timeout: 5000,
    })

    const addTask = useCallback((name: string) => {
        const task: BackgroundTask = {
            id: Date.now(),
            name,
            status: 'pending',
            progress: 0,
            startTime: Date.now(),
        }
        setTasks((prev) => [...prev, task])
        console.log(`📋 Task added: ${name}`)
    }, [])

    const processTask = useCallback(
        (taskId: number) => {
            const task = tasks.find((t) => t.id === taskId)
            if (!task) return

            const scheduledId = scheduleTask(async () => {
                console.log(`⚙️ Running task: ${task.name}`)

                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? { ...t, status: 'running', progress: 0 } : t))
                )

                try {
                    // Simulate work
                    let progress = 0
                    while (progress < 100) {
                        progress += Math.random() * 30
                        if (progress > 100) progress = 100

                        setTasks((prev) =>
                            prev.map((t) => (t.id === taskId ? { ...t, progress: Math.round(progress) } : t))
                        )

                        // Small delay to simulate work
                        await new Promise((resolve) => setTimeout(resolve, 100))
                    }

                    setTasks((prev) =>
                        prev.map((t) =>
                            t.id === taskId
                                ? { ...t, status: 'completed', progress: 100, endTime: Date.now() }
                                : t
                        )
                    )

                    console.log(`✅ Task completed: ${task.name}`)
                } catch (error) {
                    console.error(`❌ Task error: ${task.name}`, error)
                    setTasks((prev) =>
                        prev.map((t) =>
                            t.id === taskId
                                ? { ...t, status: 'cancelled', endTime: Date.now() }
                                : t
                        )
                    )
                }
            })

            if (scheduledId > 0) {
                taskScheduleMapRef.current.set(taskId, () => cancelTask(scheduledId))
            }
        },
        [scheduleTask, cancelTask, tasks]
    )

    const startProcessing = useCallback(() => {
        if (tasks.length === 0) {
            alert('📋 Add tasks first!')
            return
        }

        setIsRunning(true)
        tasks
            .filter((t) => t.status === 'pending')
            .forEach((task) => {
                processTask(task.id)
            })
    }, [tasks, processTask])

    const pauseProcessing = useCallback(() => {
        setIsRunning(false)
    }, [])

    const cancelSingleTask = useCallback((taskId: number) => {
        const cancelFn = taskScheduleMapRef.current.get(taskId)
        if (cancelFn) {
            cancelFn()
            taskScheduleMapRef.current.delete(taskId)
        }

        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId
                    ? { ...t, status: 'cancelled', endTime: Date.now() }
                    : t
            )
        )
    }, [])

    const totalProgress = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0
    const completedCount = tasks.filter((t) => t.status === 'completed').length

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>⏳ Hook: useIdleCallback</h2>
                <p style={styles.description}>
                    Schedule background tasks during browser idle time without blocking user interaction
                </p>

                {/* Stats */}
                <div style={styles.statsBox}>
                    <div>
                        <strong>📊 Progress:</strong> {totalProgress}%
                    </div>
                    <div>
                        <strong>✅ Completed:</strong> {completedCount} / {tasks.length}
                    </div>
                    <div>
                        <strong>⏳ Pending:</strong> {pendingTaskCount}
                    </div>
                    <div>
                        <strong>🔄 Status:</strong> {isRunning ? 'Running...' : 'Paused'}
                    </div>
                </div>

                {/* Supported Check */}
                <div style={{
                    ...styles.infoBox,
                    backgroundColor: isSupported ? '#d5f4e6' : '#fff3cd',
                }}>
                    {isSupported ? '✅ requestIdleCallback supported' : '⚠️ Using setTimeout fallback'}
                </div>

                {/* Controls */}
                <div style={styles.controlsSection}>
                    <div style={styles.buttonGroup}>
                        <button onClick={() => addTask(`Analytics Sync ${tasks.length + 1}`)} style={styles.button}>
                            📊 Add Analytics
                        </button>
                        <button onClick={() => addTask(`Compression ${tasks.length + 1}`)} style={styles.button}>
                            📦 Add Compression
                        </button>
                        <button onClick={() => addTask(`Backup ${tasks.length + 1}`)} style={styles.button}>
                            💾 Add Backup
                        </button>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            onClick={startProcessing}
                            disabled={isRunning || tasks.length === 0}
                            style={{
                                ...styles.button,
                                backgroundColor: isRunning || tasks.length === 0 ? '#95a5a6' : '#27ae60',
                            }}
                        >
                            ▶️ Start
                        </button>
                        <button
                            onClick={pauseProcessing}
                            disabled={!isRunning}
                            style={{
                                ...styles.button,
                                backgroundColor: !isRunning ? '#95a5a6' : '#e74c3c',
                            }}
                        >
                            ⏸️ Pause
                        </button>
                        <button
                            onClick={() => {
                                setTasks([])
                                taskScheduleMapRef.current.clear()
                            }}
                            style={{ ...styles.button, backgroundColor: '#95a5a6' }}
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                {tasks.length > 0 && (
                    <div style={styles.progressSection}>
                        <div style={styles.progressLabel}>Overall Progress: {totalProgress}%</div>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${totalProgress}%` }} />
                        </div>
                    </div>
                )}

                {/* Task List */}
                <div style={styles.tasksSection}>
                    <h3>📋 Task Queue ({tasks.length})</h3>
                    {tasks.length === 0 ? (
                        <div style={styles.empty}>No tasks. Add tasks using the buttons above.</div>
                    ) : (
                        <div style={styles.tasksList}>
                            {tasks.map((task) => (
                                <div key={task.id} style={styles.taskItem}>
                                    <div style={styles.taskHeader}>
                                        <div>
                                            <strong>{task.name}</strong>
                                            <span
                                                style={{
                                                    ...styles.taskStatus,
                                                    backgroundColor: {
                                                        pending: '#f39c12',
                                                        running: '#3498db',
                                                        completed: '#27ae60',
                                                        cancelled: '#e74c3c',
                                                    }[task.status],
                                                }}
                                            >
                                                {task.status === 'pending' && '⏳'}
                                                {task.status === 'running' && '⚙️'}
                                                {task.status === 'completed' && '✅'}
                                                {task.status === 'cancelled' && '❌'}
                                                {' '}{task.status}
                                            </span>
                                        </div>
                                        <div style={styles.taskProgress}>{Math.round(task.progress)}%</div>
                                    </div>
                                    <div style={styles.taskProgressBar}>
                                        <div style={{ ...styles.taskProgressFill, width: `${task.progress}%` }} />
                                    </div>
                                    <div style={styles.taskFooter}>
                                        <span>Duration: {task.endTime ? Math.round((task.endTime - task.startTime) / 1000) : '...'} seconds</span>
                                        {task.status === 'pending' || task.status === 'running' ? (
                                            <button
                                                onClick={() => cancelSingleTask(task.id)}
                                                style={{ ...styles.cancelButton, padding: '4px 8px', fontSize: '12px' }}
                                            >
                                                Cancel
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features:</h4>
                    <ul style={styles.list}>
                        <li>✅ Schedule tasks during idle time</li>
                        <li>✅ Don't block user interactions</li>
                        <li>✅ Fallback to setTimeout</li>
                        <li>✅ Task cancellation</li>
                        <li>✅ Automatic cleanup on unmount</li>
                        <li>✅ Perfect for analytics, sync, cleanup</li>
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
        display: 'grid' as const,
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '13px',
    } as React.CSSProperties,
    controlsSection: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    } as React.CSSProperties,
    buttonGroup: {
        display: 'flex' as const,
        gap: '8px',
        marginBottom: '10px',
        flexWrap: 'wrap' as const,
    } as React.CSSProperties,
    button: {
        flex: 1,
        minWidth: '130px',
        padding: '10px 16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
    } as React.CSSProperties,
    progressSection: { marginBottom: '20px' },
    progressLabel: { marginBottom: '8px', fontWeight: 'bold' },
    progressBar: {
        width: '100%',
        height: '20px',
        backgroundColor: '#ecf0f1',
        borderRadius: '10px',
        overflow: 'hidden' as const,
    } as React.CSSProperties,
    progressFill: {
        height: '100%',
        backgroundColor: '#27ae60',
        transition: 'width 0.3s',
    } as React.CSSProperties,
    tasksSection: { marginBottom: '20px' },
    tasksList: { display: 'flex' as const, flexDirection: 'column' as const, gap: '12px' },
    taskItem: {
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #e9ecef',
    } as React.CSSProperties,
    taskHeader: {
        display: 'flex' as const,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    } as React.CSSProperties,
    taskStatus: {
        marginLeft: '10px',
        padding: '2px 8px',
        borderRadius: '3px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    taskProgress: { fontWeight: 'bold', minWidth: '40px', textAlign: 'right' as const },
    taskProgressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#ecf0f1',
        borderRadius: '3px',
        overflow: 'hidden' as const,
        marginBottom: '4px',
    } as React.CSSProperties,
    taskProgressFill: {
        height: '100%',
        backgroundColor: '#3498db',
        transition: 'width 0.1s',
    } as React.CSSProperties,
    taskFooter: {
        display: 'flex' as const,
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#666',
    } as React.CSSProperties,
    cancelButton: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
    } as React.CSSProperties,
    empty: { textAlign: 'center' as const, padding: '20px', color: '#999' },
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '20px',
    } as React.CSSProperties,
    list: { marginLeft: '20px', lineHeight: '1.8' },
}

export default UseIdleCallbackDemo