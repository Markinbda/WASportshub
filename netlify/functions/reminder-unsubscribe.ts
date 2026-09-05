import { adminClient, sha256, siteUrl } from '../lib/shared'

export default async (request: Request) => {
  const rawToken = new URL(request.url).searchParams.get('token')
  if (!rawToken) return Response.redirect(`${siteUrl()}/calendar?reminder=invalid`, 302)
  try {
    const client = adminClient()
    const { data, error } = await client.from('reminder_subscribers').select('id').eq('unsubscribe_token_hash', await sha256(rawToken)).maybeSingle()
    if (error || !data) return Response.redirect(`${siteUrl()}/calendar?reminder=invalid`, 302)
    const { error: updateError } = await client.from('reminder_subscribers').update({ is_verified: false, unsubscribed_at: new Date().toISOString() }).eq('id', data.id)
    if (updateError) throw updateError
    return Response.redirect(`${siteUrl()}/calendar?reminder=unsubscribed`, 302)
  } catch (error) {
    console.error('[reminder-unsubscribe]', error)
    return Response.redirect(`${siteUrl()}/calendar?reminder=error`, 302)
  }
}
