import React, { useState, useRef, useEffect } from 'react'
import { useWebSocketAdvanced } from '../../packages/core/src/hooks/useWebSocketAdvanced'

interface ChatMessage {
    id: string
    author: string
    content: string
    timestamp: number
    type: 'sent' | 'received'
}

export function UseWebSocketAdvancedDemo() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [username, setUsername] = useState(() => `User-${Math.random().toString(36).substr(2, 9)}`)
    const [isJoined, setIsJoined] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Use real WebSocket server
    const wsUrl = 'ws://localhost:8080'

    const { send, readyState, disconnect, reconnect } = useWebSocketAdvanced<any>(wsUrl, {
        onOpen: () => {
            console.log('✅ WebSocket opened')
        },
        onMessage: (data: any) => {
            console.log('📨 Message:', data)

            if (!data || typeof data !== 'object') return

            const chatMessage: ChatMessage = {
                id: data.id || Date.now().toString(),
                author: data.author || 'System',
                content: data.content || '',
                timestamp: data.timestamp || Date.now(),
                type: data.senderType === 'self' ? 'sent' : 'received',
            }

            setMessages((prev) => {
                if (prev.some((m) => m.id === chatMessage.id)) return prev
                return [...prev, chatMessage]
            })
        },
        onError: (event) => {
            console.error('❌ Error:', event)
        },
        onClose: () => {
            console.log('🔌 Closed')
        },
        reconnectAttempts: 5,
        reconnectInterval: 3000,
    })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = () => {
        if (!inputMessage.trim() || !isJoined) return

        const message: ChatMessage = {
            id: Date.now().toString(),
            author: username,
            content: inputMessage,
            timestamp: Date.now(),
            type: 'sent',
        }

        setMessages((prev) => [...prev, message])

        if (readyState === WebSocket.OPEN) {
            send({
                type: 'message',
                author: username,
                content: inputMessage,
                timestamp: Date.now(),
                senderType: 'self',
            })
        }

        setInputMessage('')
    }

    const handleJoin = () => {
        if (!username.trim()) {
            alert('⚠️ Enter username')
            return
        }

        setIsJoined(true)
        setMessages([
            {
                id: 'join-' + Date.now(),
                author: 'System',
                content: `${username} joined`,
                timestamp: Date.now(),
                type: 'received',
            },
        ])

        if (readyState === WebSocket.OPEN) {
            send({
                type: 'join',
                author: username,
                content: `${username} joined the chat`,
                timestamp: Date.now(),
            })
        }
    }

    const handleLeave = () => {
        if (readyState === WebSocket.OPEN) {
            send({
                type: 'leave',
                author: username,
                content: `${username} left the chat`,
                timestamp: Date.now(),
            })
        }

        setIsJoined(false)
        setMessages([])
    }

    const getStatusText = (): string => {
        switch (readyState) {
            case WebSocket.CONNECTING:
                return '🔄 Connecting...'
            case WebSocket.OPEN:
                return '✅ Connected'
            case WebSocket.CLOSING:
                return '⏳ Closing...'
            case WebSocket.CLOSED:
                return '❌ Disconnected'
            default:
                return '❓ Unknown'
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>💬 useWebSocketAdvanced</h2>
                <p style={styles.description}>Real-time chat with auto-reconnection</p>

                <div style={styles.serverInfo}>
                    <strong>Server:</strong> {wsUrl}
                    <p style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                        Make sure your WebSocket server is running on port 8080
                    </p>
                </div>

                <div style={styles.statusBar}>
                    <div>
                        <strong>Status:</strong> {getStatusText()}
                    </div>
                    <div>
                        <strong>Messages:</strong> {messages.length}
                    </div>
                </div>

                {!isJoined ? (
                    <div style={styles.joinSection}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            style={styles.input}
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button onClick={handleJoin} style={{ ...styles.button, backgroundColor: '#27ae60' }}>
                            📱 Join Chat
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={styles.chatBox}>
                            {messages.length === 0 ? (
                                <div style={styles.empty}>⏳ Waiting for messages...</div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            ...styles.messageBubble,
                                            alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                                            backgroundColor: msg.type === 'sent' ? '#3498db' : '#ecf0f1',
                                            color: msg.type === 'sent' ? 'white' : '#333',
                                        }}
                                    >
                                        <div style={styles.messageAuthor}>{msg.author}</div>
                                        <div>{msg.content}</div>
                                        <div style={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={styles.inputArea}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type message..."
                                style={styles.messageInput}
                                disabled={readyState !== WebSocket.OPEN}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={readyState !== WebSocket.OPEN}
                                style={{
                                    ...styles.button,
                                    backgroundColor: readyState === WebSocket.OPEN ? '#3498db' : '#95a5a6',
                                }}
                            >
                                📤 Send
                            </button>
                        </div>

                        <div style={styles.actionButtons}>
                            <button onClick={() => reconnect()} style={{ ...styles.miniButton, backgroundColor: '#f39c12' }}>
                                🔄 Reconnect
                            </button>
                            <button onClick={handleLeave} style={{ ...styles.miniButton, backgroundColor: '#e74c3c' }}>
                                👋 Leave Chat
                            </button>
                        </div>
                    </>
                )}

                <div style={styles.infoBox}>
                    <h4>✅ Key Features:</h4>
                    <ul style={styles.list}>
                        <li>✅ Real WebSocket connection</li>
                        <li>✅ Auto-reconnection with exponential backoff</li>
                        <li>✅ Message queueing when offline</li>
                        <li>✅ Heartbeat mechanism</li>
                        <li>✅ Full TypeScript support</li>
                        <li>✅ Zero dependencies</li>
                    </ul>
                </div>

                <div style={styles.setupBox}>
                    <h4>🚀 Setup WebSocket Server for Testing:</h4>
                    <pre style={styles.codeBlock}>
                        {`# Install ws package
npm install ws

# Create server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => console.log('Client disconnected'));
});

# Run server
node server.js`}
                    </pre>
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
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '700px',
    } as React.CSSProperties,
    description: { color: '#666', marginBottom: '15px' } as React.CSSProperties,
    serverInfo: {
        backgroundColor: '#e3f2fd',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
    } as React.CSSProperties,
    statusBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        backgroundColor: '#ecf0f1',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
    } as React.CSSProperties,
    joinSection: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px',
    } as React.CSSProperties,
    input: {
        flex: 1,
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
        fontWeight: 'bold',
    } as React.CSSProperties,
    chatBox: {
        flex: 1,
        overflow: 'auto' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        marginBottom: '10px',
    } as React.CSSProperties,
    messageBubble: {
        padding: '8px 12px',
        borderRadius: '6px',
        maxWidth: '70%',
        wordWrap: 'break-word' as const,
        fontSize: '14px',
    } as React.CSSProperties,
    messageAuthor: {
        fontSize: '12px',
        fontWeight: 'bold',
        opacity: 0.8,
        marginBottom: '2px',
    } as React.CSSProperties,
    messageTime: {
        fontSize: '11px',
        opacity: 0.6,
        marginTop: '2px',
    } as React.CSSProperties,
    empty: {
        textAlign: 'center' as const,
        color: '#999',
        padding: '20px',
    } as React.CSSProperties,
    inputArea: {
        display: 'flex',
        gap: '8px',
        marginBottom: '10px',
    } as React.CSSProperties,
    messageInput: {
        flex: 1,
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    actionButtons: {
        display: 'flex',
        gap: '8px',
        marginBottom: '15px',
    } as React.CSSProperties,
    miniButton: {
        flex: 1,
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    infoBox: {
        backgroundColor: '#d5f4e6',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
    } as React.CSSProperties,
    setupBox: {
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '4px',
        fontSize: '12px',
    } as React.CSSProperties,
    codeBlock: {
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '12px',
        borderRadius: '4px',
        overflow: 'auto' as const,
        fontSize: '11px',
        fontFamily: 'monospace',
        marginTop: '8px',
    } as React.CSSProperties,
    list: {
        marginLeft: '20px',
        lineHeight: '1.6',
        marginTop: '8px',
    } as React.CSSProperties,
}

export default UseWebSocketAdvancedDemo