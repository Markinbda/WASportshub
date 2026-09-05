import { adminClient, json, sendEmail, siteUrl, unsubscribeToken } from '../lib/shared'

export const config = { schedule: '*/15 * * * *' }

export default async () => {
  try {
    const client = adminClient()
    const now = new Date()
    const horizon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const [{ data: fixtures, error }, { data: subscribers }, { data: subscriptions }, { data: teams }, { data: venues }] = await Promise.all([
      client.from('fixtures').select('*').eq('status', 'scheduled').eq('reminders_enabled', true).gt('starts_at', now.toISOString()).lte('starts_at', horizon.toISOString()),
      client.from('reminder_subscribers').select('*').eq('is_verified', true).is('unsubscribed_at', null),
      client.from('reminder_subscriptions').select('*'),
      client.from('teams').select('id, name'),
      client.from('venues').select('id, name'),
    ])
    if (error) throw error
    const teamsById = new Map((teams ?? []).map((team) => [team.id, team.name]))
    const venuesById = new Map((venues ?? []).map((venue) => [venue.id, venue.name]))
    let sent = 0
    for (const fixture of fixtures ?? []) {
      for (const subscriber of subscribers ?? []) {
        const follows = (subscriptions ?? []).some((subscription) => subscription.subscriber_id === subscriber.id && (subscription.team_id === null || subscription.team_id === fixture.team_id))
        if (!follows) continue
        const scheduledFor = new Date(new Date(fixture.starts_at).getTime() - subscriber.default_reminder_hours * 60 * 60 * 1000)
        if (scheduledFor > now) continue
        const { error: reserveError } = await client.from('reminder_deliveries').insert({ fixture_id: fixture.id, subscriber_id: subscriber.id, scheduled_for: scheduledFor.toISOString() })
        if (reserveError?.code === '23505') continue
        if (reserveError) throw reserveError
        const unsubscribe = await unsubscribeToken(subscriber.email)
        const unsubscribeUrl = `${siteUrl()}/.netlify/functions/reminder-unsubscribe?token=${encodeURIComponent(unsubscribe)}`
        try {
          const teamName = teamsById.get(fixture.team_id) ?? 'Warwick Bears'
          const venue = fixture.venue_id ? venuesById.get(fixture.venue_id) ?? fixture.external_venue : fixture.external_venue
          const starts = new Date(fixture.starts_at).toLocaleString('en-BM', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Atlantic/Bermuda' })
          const messageId = await sendEmail(subscriber.email, `${teamName} fixture reminder`, `<h1>${teamName} vs ${fixture.opponent_name}</h1><p><strong>${starts}</strong></p><p>${venue ?? 'Venue to be confirmed'}</p><p><a href="${siteUrl()}/calendar">View the Warwick Bears calendar</a></p><hr><p style="font-size:12px"><a href="${unsubscribeUrl}">Unsubscribe from fixture reminders</a></p>`)
          await client.from('reminder_deliveries').update({ status: 'sent', sent_at: new Date().toISOString(), sendgrid_message_id: messageId, attempts: 1 }).eq('fixture_id', fixture.id).eq('subscriber_id', subscriber.id)
          sent += 1
        } catch (sendError) {
          await client.from('reminder_deliveries').update({ status: 'failed', attempts: 1, last_error: sendError instanceof Error ? sendError.message : 'Unknown delivery error' }).eq('fixture_id', fixture.id).eq('subscriber_id', subscriber.id)
        }
      }
    }
    return json({ ok: true, sent })
  } catch (error) {
    console.error('[send-reminders]', error)
    return json({ error: 'Reminder processing failed.' }, 500)
  }
}
