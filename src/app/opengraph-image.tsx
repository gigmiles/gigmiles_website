/* eslint-disable */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GigMiles | Real Net Profit for Gig Workers'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Styles moved to constants to resolve lint warnings and improve readability
// Satori (Next.js ImageResponse) requires inline styles as objects.
const styles = {
    container: {
        background: 'linear-gradient(to bottom right, #020617, #0f172a)',
        width: '100%',
        height: '100%',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        fontFamily: 'sans-serif',
    },
    meshGradientTop: {
        position: 'absolute' as const,
        top: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderRadius: '50%',
        filter: 'blur(100px)',
    },
    meshGradientBottom: {
        position: 'absolute' as const,
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderRadius: '50%',
        filter: 'blur(100px)',
    },
    contentWrapper: {
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: '30px',
    },
    logoWrapper: {
        display: 'flex' as const,
        padding: '24px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    },
    textContainer: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'flex-start' as const,
    },
    title: {
        fontSize: '84px',
        fontWeight: '900',
        color: 'white',
        letterSpacing: '-4px',
        fontStyle: 'italic',
    },
    brandMiles: {
        color: '#10b981',
    },
    subtitle: {
        fontSize: '24px',
        color: '#94a3b8',
        fontWeight: '500',
        letterSpacing: '4px',
        textTransform: 'uppercase' as const,
        marginTop: '-10px',
    }
}

export default async function Image() {
    return new ImageResponse(
        (
            <div {...{ style: styles.container }}>
                {/* Animated Mesh Gradients (Static in ImageResponse but styled) */}
                <div {...{ style: styles.meshGradientTop }} />
                <div {...{ style: styles.meshGradientBottom }} />

                <div {...{ style: styles.contentWrapper }}>
                    {/* Logo Icon — G mark (Satori-safe: no filters) */}
                    <div {...{ style: styles.logoWrapper }}>
                        <svg
                            width="100"
                            height="100"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Dark rounded-square background */}
                            <rect x="3" y="3" width="94" height="94" rx="22"
                                fill="#0D2318"
                            />
                            <rect x="3" y="3" width="94" height="94" rx="22"
                                stroke="#10B981" strokeWidth="1.5" opacity="0.25"
                            />
                            {/* G letter: large CCW arc from top(50,17) to right(83,50) + crossbar + stub */}
                            <path
                                d="M 50 17 A 33 33 0 1 0 83 50 L 57 50 L 57 65"
                                stroke="#10B981"
                                strokeWidth="11"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            {/* Accent dots */}
                            <circle cx="50" cy="17" r="3.5" fill="#6EE7B7" opacity="0.6" />
                            <circle cx="57" cy="65" r="3"   fill="#C1FF72" opacity="0.7" />
                        </svg>
                    </div>

                    <div {...{ style: styles.textContainer }}>
                        <div {...{ style: styles.title }}>
                            Gig<span {...{ style: styles.brandMiles }}>Miles</span>
                        </div>
                        <div {...{ style: styles.subtitle }}>
                            Real Net Profit
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
