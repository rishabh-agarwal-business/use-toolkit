import React, { useRef } from 'react'
import { useIntersectionObserverAdvanced } from '../../packages/core/src'

interface ImageItem {
    id: number
    title: string
    thumbnail: string
    full: string
}

/**
 * DEMO 9: useIntersectionObserverAdvanced
 * 
 * Real-World: Lazy-Loading Image Gallery
 * 
 * This demo shows:
 * - Lazy loading images when visible
 * - Intersection detection
 * - Performance optimization
 * - Visibility tracking
 * - Multiple observers
 */
export function UseIntersectionObserverDemo() {
    // Mock image data
    const images: ImageItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Image ${i + 1}`,
        thumbnail: `https://picsum.photos/id/${i + 10}/100/100`,
        full: `https://picsum.photos/id/${i + 10}/600/400`,
    }));


    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>🖼️ Hook: useIntersectionObserverAdvanced</h2>
                <p style={styles.description}>
                    Lazy load images and detect visibility for performance optimization
                </p>

                <div style={styles.statsBox}>
                    <p>📸 Scroll down to lazy load images when they become visible</p>
                    <p>⚡ Only loaded images are rendered - great for performance!</p>
                </div>

                <div style={styles.gallery}>
                    {images.map((image) => (
                        <ImageCard key={image.id} image={image} />
                    ))}
                </div>

                <div style={styles.infoBox}>
                    <h4>💡 Key Features Demonstrated:</h4>
                    <ul style={styles.list}>
                        <li>✅ Lazy load images on visibility</li>
                        <li>✅ Detect when elements enter viewport</li>
                        <li>✅ Optimize performance with virtual rendering</li>
                        <li>✅ Track visibility state</li>
                        <li>✅ Intersection count tracking</li>
                        <li>✅ Once option for one-time load</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

interface ImageCardProps {
    image: ImageItem
}

function ImageCard({ image }: ImageCardProps) {
    const { ref, isIntersecting, triggerCount } = useIntersectionObserverAdvanced<HTMLDivElement>({
        threshold: 0.5, // Trigger when 50% visible
    })

    return (
        <div ref={ref} style={styles.imageCard}>
            <div style={styles.imageContainer}>
                {isIntersecting ? (
                    <img
                        src={image.full}
                        alt={image.title}
                        style={styles.image}
                        onLoad={() => console.log(`✅ Image ${image.id} loaded`)}
                    />
                ) : (
                    <div style={styles.placeholder}>
                        <div>📥 Not visible yet</div>
                        <div style={{ fontSize: '12px' }}>Scroll to load</div>
                    </div>
                )}
            </div>
            <div style={styles.imageInfo}>
                <h4>{image.title}</h4>
                <p style={styles.badge}>
                    {isIntersecting ? '👁️ Visible' : '🚫 Hidden'} | Viewed: {triggerCount}x
                </p>
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
    statsBox: {
        backgroundColor: '#d5f4e6',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '14px',
    } as React.CSSProperties,
    gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
    } as React.CSSProperties,
    imageCard: {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    } as React.CSSProperties,
    imageContainer: {
        width: '100%',
        paddingBottom: '100%',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        backgroundColor: '#f0f0f0',
    } as React.CSSProperties,
    image: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    } as React.CSSProperties,
    placeholder: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        color: '#999',
        fontSize: '14px',
    } as React.CSSProperties,
    imageInfo: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
    } as React.CSSProperties,
    badge: {
        margin: 0,
        fontSize: '12px',
        color: '#666',
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

export default UseIntersectionObserverDemo