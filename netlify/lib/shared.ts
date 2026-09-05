import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/database.types'

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export function adminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server Supabase configuration is unavailable.')
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function token() {
  return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll('-', '')}`
}

export async function unsubscribeToken(email: string) {
  const secret = process.env.REMINDER_TOKEN_SECRET
  if (!secret) throw new Error('Reminder token configuration is unavailable.')
  return sha256(`${secret}:${email.toLowerCase()}`)
}

export function siteUrl() {
  return (process.env.URL || 'https://wasportshub.netlify.app').replace(/\/$/, '')
}

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY
  const from = process.env.SENDGRID_FROM_EMAIL
  if (!apiKey || !from) throw new Error('SendGrid configuration is unavailable.')
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: from, name: 'Warwick Bears Athletics' }, subject, content: [{ type: 'text/html', value: html }] }),
  })
  if (!response.ok) throw new Error(`SendGrid rejected the message (${response.status}).`)
  return response.headers.get('x-message-id')
}