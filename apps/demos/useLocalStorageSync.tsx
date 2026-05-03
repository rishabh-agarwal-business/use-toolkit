import React, { useState } from 'react'
import { useLocalStorageSync } from '../../packages/core/src';

interface UserPreferences {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    language: 'en' | 'es' | 'fr' | 'de'
    notifications: boolean
    autoSave: boolean
    compactMode: boolean
}

/**
 * DEMO 7: useLocalStorageSync
 * 
 * Real-World: User Preferences Manager
 * 
 * This demo shows:
 * - Persistent storage across sessions
 * - Cross-tab synchronization
 * - TTL (Time-to-Live) expiration
 * - Real-time preference updates
 * - Default values
 */
export function UseLocalStorageSyncDemo() {
    const [lastSyncTime, setLastSyncTime] = useState<string>('')

    const defaultPreferences: UserPreferences = {
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        notifications: true,
        autoSave: true,
        compactMode: false,
    }

    const { value: preferences, setValue: setPreferences } = useLocalStorageSync<UserPreferences>(
        'user-preferences',
        defaultPreferences,
        {
            ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
            json: true,
        }
    )

    // Safely destructure with fallback to defaults
    const currentPrefs = preferences || defaultPreferences
    const { theme, fontSize, language, notifications, autoSave, compactMode } = currentPrefs

    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        try {
            setPreferences((prev: UserPreferences) => {
                // Ensure we have valid preferences object
                if (!prev) {
                    return { ...defaultPreferences, [key]: value }
                }
                return { ...prev, [key]: value }
            })

            setLastSyncTime(new Date().toLocaleTimeString())
            console.log(`✅ Updated ${key}:`, value)
        } catch (error) {
            console.error(`❌ Error updating ${key}:`, error)
        }
    }

    const resetPreferences = () => {
        try {
            setPreferences(defaultPreferences)
            setLastSyncTime(new Date().toLocaleTimeString())
            console.log('🔄 Preferences reset to defaults')
        } catch (error) {
            console.error('❌ Error resetting preferences:', error)
        }
    }

    const bgColor =
        theme === 'dark' ? '#2c3e50' : theme === 'light' ? '#ecf0f1' : '#f8f9fa'

    const textColor = theme === 'dark' ? '#ecf0f1' : '#2c3e50'

    const fontSizeMap = {
        small: '12px',
        medium: '14px',
        large: '16px',
    }

    const languageNames = {
        en: '🇬🇧 English',
        es: '🇪🇸 Español',
        fr: '🇫🇷 Français',
        de: '🇩🇪 Deutsch',
    }

    return (
        <div
            style={{
                ...styles.container,
                backgroundColor: bgColor,
                color: textColor,
                fontSize: fontSizeMap[fontSize],
            }}
        >
            <div style={styles.card}>
                <h2>💾 Hook: useLocalStorageSync</h2>
                <p style={styles.description}>
                    Persist user preferences across sessions with cross-tab synchronization
                </p>

                {/* Status */}
                <div style={styles.statusBox}>
                    <div>
                        <strong>✅ Status:</strong> {preferences ? 'Synced' : 'Loading...'}
                    </div>
                    {lastSyncTime && (
                        <div>
                            <strong>⏰ Last Sync:</strong> {lastSyncTime}
                        </div>
                    )}
                    <div>
                        <strong>📊 Storage:</strong> localStorage
                    </div>
                </div>

                {/* Settings Grid */}
                <div style={styles.settingsGrid}>
                    {/* Theme */}
                    <div style={styles.settingCard}>
                        <h3>🎨 Theme</h3>
                        <div style={styles.optionGroup}>
                            {(['light', 'dark', 'auto'] as const).map((option) => (
                                <label key={option} style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={option}
                                        checked={theme === option}
                                        onChange={(e) => updatePreference('theme', e.target.value as any)}
                                        style={styles.radio}
                                    />
                                    <span>
                                        {option === 'light' ? '☀️' : option === 'dark' ? '🌙' : '⚙️'}{' '}
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Font Size */}
                    <div style={styles.settingCard}>
                        <h3>🔤 Font Size</h3>
                        <div style={styles.optionGroup}>
                            {(['small', 'medium', 'large'] as const).map((size) => (
                                <label key={size} style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="fontSize"
                                        value={size}
                                        checked={fontSize === size}
                                        onChange={(e) => updatePreference('fontSize', e.target.value as any)}
                                        style={styles.radio}
                                    />
                                    <span style={{ fontSize: fontSizeMap[size] }}>
                                        {size === 'small' ? 'A' : size === 'medium' ? 'B' : 'C'} {size}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div style={styles.settingCard}>
                        <h3>🌐 Language</h3>
                        <select
                            value={language}
                            onChange={(e) => updatePreference('language', e.target.value as any)}
                            style={styles.select}
                        >
                            {Object.entries(languageNames).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Toggles */}
                    <div style={styles.settingCard}>
                        <h3>⚙️ Options</h3>
                        <div style={styles.toggleGroup}>
                            <label style={styles.toggleLabel}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={(e) => updatePreference('notifications', e.target.checked)}
                                    style={styles.checkbox}
                                />
                                <span>🔔 Notifications</span>
                            </label>
                            <label style={styles.toggleLabel}>
                                <input
                                    type="checkbox"
                                    checked={autoSave}
                                    onChange={(e) => updatePreference('autoSave', e.target.checked)}
                                    style={styles.checkbox}
                                />
                                <span>💾 Auto-save</span>
                            </label>
                            <label style={styles.toggleLabel}>
                                <input
                                    type="checkbox"
                                    checked={compactMode}
                                    onChange={(e) => updatePreference('compactMode', e.target.checked)}
                                    style={styles.checkbox}
                                />
                                <span>📦 Compact Mode</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Current Preferences */}
                <div style={styles.preferencesBox}>
                    <h3>📋 Current Preferences (Stored in localStorage)</h3>
                    <pre style={styles.preCode}>{JSON.stringify(currentPrefs, null, 2)}</pre>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        onClick={resetPreferences}
                        style={{ ...styles.button, backgroundColor: '#e74c3c' }}
                    >
                        🔄 Reset to Defaults
                    </button>
                    <button
                        onClick={() => {
                            try {
                                const json = JSON.stringify(currentPrefs, null, 2)
                                navigator.clipboard.writeText(json)
                                alert('✅ Preferences copied to clipboard!')
                            } catch (error) {
                                alert('❌ Failed to copy to clipboard')
                            }
                        }}
                        style={styles.button}
                    >
                        📋 Copy as JSON
                    </button>
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>✅ Persistent storage - survives page refresh</li>
                        <li>✅ Cross-tab sync - changes reflect in other tabs</li>
                        <li>✅ TTL support - auto-expires after 30 days</li>
                        <li>✅ Type-safe preferences object</li>
                        <li>✅ Real-time UI updates on preference change</li>
                        <li>✅ Default values fallback for safety</li>
                        <li>✅ Error handling for storage operations</li>
                    </ul>
                </div>

                <div style={styles.tipsBox}>
                    <h4>💻 Open multiple tabs of this page!</h4>
                    <p>
                        Change preferences in one tab and watch them update in other tabs automatically. This
                        demonstrates real-time cross-tab synchronization using storage events.
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        Try opening DevTools Console to see sync logs.
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '20px',
        transition: 'background-color 0.3s, color 0.3s',
    } as React.CSSProperties,
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    } as React.CSSProperties,
    description: { color: '#666', marginBottom: '15px' } as React.CSSProperties,
    statusBox: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        backgroundColor: '#d5f4e6',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '13px',
    } as React.CSSProperties,
    settingsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
    } as React.CSSProperties,
    settingCard: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
    } as React.CSSProperties,
    optionGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    } as React.CSSProperties,
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    } as React.CSSProperties,
    radio: {
        cursor: 'pointer',
    } as React.CSSProperties,
    select: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    } as React.CSSProperties,
    toggleGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
    } as React.CSSProperties,
    toggleLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    } as React.CSSProperties,
    checkbox: {
        cursor: 'pointer',
    } as React.CSSProperties,
    preferencesBox: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #e9ecef',
    } as React.CSSProperties,
    preCode: {
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '12px',
        borderRadius: '4px',
        overflow: 'auto' as const,
        fontSize: '12px',
        fontFamily: 'monospace',
    } as React.CSSProperties,
    actions: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    } as React.CSSProperties,
    button: {
        padding: '10px 16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    } as React.CSSProperties,
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
    list: {
        marginLeft: '20px',
        lineHeight: '1.8',
    } as React.CSSProperties,
}

export default UseLocalStorageSyncDemo