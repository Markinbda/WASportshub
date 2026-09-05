import type { LiveFixture } from './athletics'

function icsDate(value: string) {
  return new Date(value).toISOString().replaceAll('-', '').replaceAll(':', '').replace('.000', '')
}

function escapeIcs(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n')
}

export function downloadFixtureCalendar(fixtures: LiveFixture[], filename = 'warwick-bears-fixtures.ics') {
  const events = fixtures.map((fixture) => [
    'BEGIN:VEVENT',
    `UID:${fixture.id}@wasportshub.netlify.app`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(fixture.startsAt)}`,
    fixture.endsAt ? `DTEND:${icsDate(fixture.endsAt)}` : null,
    `SUMMARY:${escapeIcs(`${fixture.teamName} vs ${fixture.opponentName}`)}`,
    `LOCATION:${escapeIcs(fixture.venueName)}`,
    fixture.notes ? `DESCRIPTION:${escapeIcs(fixture.notes)}` : null,
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')).join('\r\n')
  const body = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Warwick Academy//Athletics Hub//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR\r\n`
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}