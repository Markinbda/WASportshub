import { createClient } from '@supabase/supabase-js'
import { adminClient, json, siteUrl } from '../lib/shared'
import type { Database } from '../../src/lib/database.types'

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  try {
    const authorization = request.headers.get('authorization')
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
    if (!token) return json({ error: 'Authentication required.' }, 401)
    const url = process.env.SUPABASE_URL
    const anonKey = process.env.SUPABASE_ANON_KEY
    if (!url || !anonKey) throw new Error('Server authentication configuration is unavailable.')
    const verifier = createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: userResult, error: userError } = await verifier.auth.getUser(token)
    if (userError || !userResult.user) return json({ error: 'Invalid session.' }, 401)
    const client = adminClient()
    const { data: actor } = await client.from('staff_profiles').select('role, is_active').eq('user_id', userResult.user.id).maybeSingle()
    if (!actor?.is_active || actor.role !== 'admin') return json({ error: 'Administrator access required.' }, 403)
    const body = await request.json() as { email?: string; displayName?: string; role?: 'coach' | 'editor' | 'admin' }
    const email = body.email?.trim().toLowerCase()
    const displayName = body.displayName?.trim()
    if (!email || !displayName || !body.role) return json({ error: 'Email, display name, and role are required.' }, 400)
    const { data: invited, error: inviteError } = await client.auth.admin.inviteUserByEmail(email, { redirectTo: `${siteUrl()}/admin` })
    if (inviteError) throw inviteError
    const { error: profileError } = await client.from('staff_profiles').upsert({ user_id: invited.user.id, email, display_name: displayName, role: body.role, is_active: true })
    if (profileError) throw profileError
    return json({ ok: true, message: `Invitation sent to ${email}.` })
  } catch (error) {
    console.error('[admin-invite]', error)
    return json({ error: error instanceof Error ? error.message : 'The invitation could not be sent.' }, 500)
  }
}
