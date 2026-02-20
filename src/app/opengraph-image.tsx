import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GigMiles | Professional Earnings Performance'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #020617, #0f172a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Animated Mesh Gradients (Static in ImageResponse but styled) */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '50%',
                        height: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        right: '-10%',
                        width: '50%',
                        height: '50%',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '30px',
                    }}
                >
                    {/* Logo Icon */}
                    <div
                        style={{
                            display: 'flex',
                            padding: '24px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        }}
                    >
                        <svg
                            width="100"
                            height="100"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M20 20L50 10L80 20L90 50L80 80L50 90L20 80L10 50L20 20Z"
                                fill="#10b98122"
                                stroke="#10b981"
                                strokeWidth="2"
                            />
                            <path
                                d="M75 35C75 25 60 20 50 20C30 20 20 35 20 50C20 65 30 80 50 80C65 80 75 70 75 55H55V45H85"
                                stroke="#ffffff"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '84px',
                                fontWeight: '900',
                                color: 'white',
                                letterSpacing: '-4px',
                                fontStyle: 'italic',
                            }}
                        >
                            Gig<span style={{ color: '#10b981' }}>Miles</span>
                        </div>
                        <div
                            style={{
                                fontSize: '24px',
                                color: '#94a3b8',
                                fontWeight: '500',
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                                marginTop: '-10px',
                            }}
                        >
                            Professional Performance
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
