import * as React from 'react'
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components'

interface WelcomeEmailProps {
    firstName: string
    memberNumber: number | null
    isFoundingMember: boolean
    appUrl: string
}

export const WelcomeEmail = ({
    firstName = 'Driver',
    memberNumber = null,
    isFoundingMember = false,
    appUrl = 'https://gigmiles.app',
}: WelcomeEmailProps) => {
    const memberTag = memberNumber
        ? `#${memberNumber.toString().padStart(4, '0')}`
        : null

    const previewText = isFoundingMember
        ? `Welcome, Founding Member ${memberTag}! Your 1 year free access starts now.`
        : `Welcome to Gigmiles, ${firstName}! Start tracking your gig earnings today.`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-[#0B1120] my-auto mx-auto font-sans">
                    <Container className="rounded-2xl my-[40px] mx-auto p-[32px] w-[480px] border border-[#1E293B]">

                        {/* Header */}
                        <Section className="text-center mb-[32px]">
                            <Text className="text-[#10B981] font-black text-[28px] tracking-tighter uppercase m-0">
                                GIGMILES
                            </Text>
                            <Text className="text-[#475569] text-[11px] uppercase tracking-widest m-0 mt-1">
                                Gig Worker Earnings Platform
                            </Text>
                        </Section>

                        <Hr className="border-[#1E293B] mb-[32px]" />

                        {/* Founding Member Badge */}
                        {isFoundingMember && memberTag && (
                            <Section className="text-center mb-[24px]">
                                <div
                                    style={{
                                        display: 'inline-block',
                                        padding: '6px 16px',
                                        borderRadius: '999px',
                                        background: 'rgba(245,158,11,0.1)',
                                        border: '1px solid rgba(245,158,11,0.3)',
                                    }}
                                >
                                    <Text className="text-amber-400 font-black text-[11px] uppercase tracking-widest m-0">
                                        ★ Founding Member {memberTag} · 1 Year Free
                                    </Text>
                                </div>
                            </Section>
                        )}

                        {/* Main heading */}
                        <Heading className="text-white text-[36px] font-black uppercase tracking-tighter text-center m-0 mb-[8px] leading-none italic">
                            {isFoundingMember ? "YOU'RE IN." : "WELCOME."}
                        </Heading>

                        <Text className="text-[#94A3B8] text-[16px] leading-[26px] text-center mb-[32px]">
                            {isFoundingMember
                                ? `Hey ${firstName}, you're one of our first 500 members. Your entire first year is on us — no credit card, no catch. Thank you for believing in Gigmiles early.`
                                : `Hey ${firstName}, your account is verified and ready to go. Start logging your earnings and let Gigmiles handle the math.`
                            }
                        </Text>

                        {/* Stats row */}
                        <Section className="mb-[32px]">
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                {[
                                    { label: 'Track Earnings', icon: '💰' },
                                    { label: 'Auto Tax Calc', icon: '🧾' },
                                    { label: 'GPS Mileage', icon: '📍' },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        style={{
                                            flex: 1,
                                            padding: '16px 8px',
                                            borderRadius: '12px',
                                            background: 'rgba(30,41,59,0.6)',
                                            border: '1px solid rgba(30,41,59,1)',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Text className="text-[20px] m-0 mb-[4px]">{item.icon}</Text>
                                        <Text className="text-[#94A3B8] text-[11px] font-semibold m-0 uppercase tracking-wide">
                                            {item.label}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* CTA */}
                        <Section className="text-center mb-[32px]">
                            <Button
                                href={`${appUrl}/dashboard`}
                                style={{
                                    background: '#10B981',
                                    color: '#000',
                                    fontWeight: 900,
                                    fontSize: '14px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '16px 40px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                }}
                            >
                                Open Gigmiles →
                            </Button>
                        </Section>

                        <Hr className="border-[#1E293B] my-[24px]" />

                        {/* Footer */}
                        <Text className="text-[#475569] text-[12px] leading-[20px] text-center m-0">
                            You're receiving this because you signed up at gigmiles.app.
                            <br />
                            © {new Date().getFullYear()} Gigmiles. All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}

export default WelcomeEmail
