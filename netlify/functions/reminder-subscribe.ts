import { adminClient, json, sendEmail, sha256, siteUrl, token, unsubscribeToken } from '../lib/shared'

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  try {
    const body = await request.json() as { email?: string; teamId?: string | null; reminderHours?: number }
    const email = body.email?.trim().toLowerCase()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400)
  const reminderHours = Math.min(168, Math.max(1, Number(body.reminderHours) || 24))
    const verificationToken = token()
  const unsubscribe = await unsubscribeToken(email)
    const client = adminClient()
    const { data: subscriber, error } = await client.from('reminder_subscribers').upsert({
      email,
      is_verified: false,
      verification_token_hash: await sha256(verificationToken),
      unsubscribe_token_hash: await sha256(unsubscribe),
      default_reminder_hours: reminderHours,
      consented_at: new Date().toISOString(),
      verified_at: null,
      unsubscribed_at: null,
    }, { onConflict: 'email' }).select('id').single()
    if (error) throw error
    const { error: subscriptionError } = await client.from('reminder_subscriptions').insert({ subscriber_id: subscriber.id, team_id: body.teamId || null })
    if (subscriptionError && subscriptionError.code !== '23505') throw subscriptionError
    const verifyUrl = `${siteUrl()}/.netlify/functions/reminder-verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`
    await sendEmail(email, 'Confirm Warwick Bears fixture reminders', `<h1>Confirm your fixture reminders</h1><p>Use the link below to confirm your Warwick Bears reminder subscription.</p><p><a href="${verifyUrl}">Confirm reminders</a></p><p>If you did not request this, no action is needed.</p>`)
    return json({ ok: true, message: 'Check your email to confirm your reminders.' })
  } catch (error) {
    console.error('[reminder-subscribe]', error)
    return json({ error: 'The reminder subscription could not be created.' }, 500)
  }
}
