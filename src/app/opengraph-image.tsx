/* eslint-disable */
import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

// Real GigMiles brand mark, embedded at build time (force-static) so the OG card
// renders the actual icon instead of a hand-drawn approximation.
const logoDataUri =
    'data:image/png;base64,' +
    readFileSync(join(process.cwd(), 'public/brand/icons/icon-180.png')).toString('base64')

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
        background: 'linear-gradient(to bottom right, #0E4F4F, #0A3C3C)',
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
        backgroundColor: 'rgba(94, 234, 212, 0.15)',
        borderRadius: '50%',
        filter: 'blur(100px)',
    },
    meshGradientBottom: {
        position: 'absolute' as const,
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
        background: 'rgba(94, 234, 212, 0.1)',
        border: '1px solid rgba(94, 234, 212, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    },
    textContainer: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'flex-start' as const,
    },
    title: {
        display: 'flex' as const,
        flexDirection: 'row' as const,
        fontSize: '84px',
        fontWeight: '900',
        color: '#5EEAD4',
        letterSpacing: '-4px',
        fontStyle: 'italic',
    },
    brandMiles: {
        color: '#5EEAD4',
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
                    {/* Logo Icon — real GigMiles brand mark (embedded PNG) */}
                    <div {...{ style: styles.logoWrapper }}>
                        <img
                            src={logoDataUri}
                            width="100"
                            height="100"
                            style={{ borderRadius: '22px' }}
                        />
                    </div>

                    <div {...{ style: styles.textContainer }}>
                        <div {...{ style: styles.title }}>
                            gigmiles
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
