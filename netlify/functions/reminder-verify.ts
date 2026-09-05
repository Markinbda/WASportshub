import { adminClient, sha256, siteUrl } from '../lib/shared'

export default async (request: Request) => {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')?.trim().toLowerCase()
  const rawToken = url.searchParams.get('token')
  if (!email || !rawToken) return Response.redirect(`${siteUrl()}/calendar?reminder=invalid`, 302)
  try {
    const client = adminClient()
    const { data, error } = await client.from('reminder_subscribers').select('id, verification_token_hash').eq('email', email).maybeSingle()
    if (error || !data || data.verification_token_hash !== await sha256(rawToken)) return Response.redirect(`${siteUrl()}/calendar?reminder=invalid`, 302)
    const { error: updateError } = await client.from('reminder_subscribers').update({ is_verified: true, verified_at: new Date().toISOString(), verification_token_hash: null }).eq('id', data.id)
    if (updateError) throw updateError
    return Response.redirect(`${siteUrl()}/calendar?reminder=confirmed`, 302)
  } catch (error) {
    console.error('[reminder-verify]', error)
    return Response.redirect(`${siteUrl()}/calendar?reminder=error`, 302)
  }
}
