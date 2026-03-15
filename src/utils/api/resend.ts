import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey && process.env.NODE_ENV === 'development') {
    console.warn('[resend] RESEND_API_KEY is missing — email sending will fail.')
}

export const resend = new Resend(apiKey ?? '')
