import { supabase } from './supabase'

export type LiveTeam = {
  id: string
  name: string
  slug: string
  ageGroup: string
  description: string
  rosterNameMode: string
  sportId: string
  sportName: string
  sportSlug: string
  seasonName: string
  schoolYear: string
  venueName: string | null
}

export type LiveFixture = {
  id: string
  teamId: string
  teamName: string
  sportName: string
  sportSlug: string
  opponentName: string
  venueName: string
  startsAt: string
  endsAt: string | null
  homeAway: 'home' | 'away' | 'neutral'
  status: 'draft' | 'scheduled' | 'completed' | 'postponed' | 'cancelled'
  notes: string | null
  result: {
    teamScore: number | null
    opponentScore: number | null
    outcome: 'win' | 'loss' | 'draw' | 'no_contest'
    summary: string | null
  } | null
}

export type PublicRosterMember = {
  membershipId: string
  displayName: string
  playerRole: string | null
  jerseyNumber: string | null
  isCaptain: boolean
}

export type LiveNewsPost = {
  id: string
  title: string
  slug: string
  summary: string
  body: string
  publishedAt: string | null
  sportName: string | null
}

export type LiveMediaItem = {
  id: string
  kind: 'photo' | 'youtube' | 'vimeo'
  caption: string
  altText: string
  capturedOn: string | null
  url: string
}

export type LiveArchive = {
  id: string
  schoolYear: string
  teamName: string
  ageGroup: string | null
  writeUp: string
  notableResults: string
  sportName: string
}

export type LiveHallOfFameProfile = {
  id: string
  name: string
  yearsAttended: string | null
  biography: string
  notableAchievement: string
  photoUrl: string | null
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase configuration is unavailable.')
  return supabase
}

export async function loadTeams(): Promise<LiveTeam[]> {
  const client = requireSupabase()
  const [{ data: teamRows, error }, { data: sportRows }, { data: seasonRows }, { data: venueRows }] = await Promise.all([
    client.from('teams').select('*').eq('is_active', true).order('name'),
    client.from('sports').select('id, name, slug'),
    client.from('seasons').select('id, name, school_year'),
    client.from('venues').select('id, name'),
  ])
  if (error) throw error
  const sportsById = new Map((sportRows ?? []).map((row) => [row.id, row]))
  const seasonsById = new Map((seasonRows ?? []).map((row) => [row.id, row]))
  const venuesById = new Map((venueRows ?? []).map((row) => [row.id, row.name]))
  return (teamRows ?? []).map((row) => {
    const sport = sportsById.get(row.sport_id)
    const season = seasonsById.get(row.season_id)
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      ageGroup: row.age_group,
      description: row.description,
      rosterNameMode: row.roster_name_mode,
      sportId: row.sport_id,
      sportName: sport?.name ?? 'Athletics',
      sportSlug: sport?.slug ?? '',
      seasonName: season?.name ?? '',
      schoolYear: season?.school_year ?? '',
      venueName: row.home_venue_id ? venuesById.get(row.home_venue_id) ?? null : null,
    }
  })
}

export async function loadPublicRoster(teamId: string): Promise<PublicRosterMember[]> {
  const { data, error } = await requireSupabase().rpc('get_public_roster', { target_team_id: teamId })
  if (error) throw error
  return (data ?? []).map((row) => ({
    membershipId: row.membership_id,
    displayName: row.display_name,
    playerRole: row.player_role,
    jerseyNumber: row.jersey_number,
    isCaptain: row.is_captain,
  }))
}

export async function loadFixtures(): Promise<LiveFixture[]> {
  const client = requireSupabase()
  const [{ data: fixtureRows, error }, { data: teamRows }, { data: sportRows }, { data: venueRows }, { data: resultRows }] = await Promise.all([
    client.from('fixtures').select('*').neq('status', 'draft').order('starts_at'),
    client.from('teams').select('id, name, sport_id'),
    client.from('sports').select('id, name, slug'),
    client.from('venues').select('id, name'),
    client.from('match_results').select('*'),
  ])
  if (error) throw error
  const teamsById = new Map((teamRows ?? []).map((row) => [row.id, row]))
  const sportsById = new Map((sportRows ?? []).map((row) => [row.id, row]))
  const venuesById = new Map((venueRows ?? []).map((row) => [row.id, row.name]))
  const resultsByFixture = new Map((resultRows ?? []).map((row) => [row.fixture_id, row]))
  return (fixtureRows ?? []).map((row) => {
    const team = teamsById.get(row.team_id)
    const sport = team ? sportsById.get(team.sport_id) : null
    const result = resultsByFixture.get(row.id)
    return {
      id: row.id,
      teamId: row.team_id,
      teamName: team?.name ?? 'Warwick Bears',
      sportName: sport?.name ?? 'Athletics',
      sportSlug: sport?.slug ?? '',
      opponentName: row.opponent_name,
      venueName: row.venue_id ? venuesById.get(row.venue_id) ?? row.external_venue ?? 'Venue TBC' : row.external_venue ?? 'Venue TBC',
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      homeAway: row.home_away,
      status: row.status,
      notes: row.notes,
      result: result ? {
        teamScore: result.team_score,
        opponentScore: result.opponent_score,
        outcome: result.outcome,
        summary: result.summary,
      } : null,
    }
  })
}

export async function loadNews(): Promise<LiveNewsPost[]> {
  const client = requireSupabase()
  const [{ data, error }, { data: sportRows }] = await Promise.all([
    client.from('news_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }),
    client.from('sports').select('id, name'),
  ])
  if (error) throw error
  const sportsById = new Map((sportRows ?? []).map((row) => [row.id, row.name]))
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    publishedAt: row.published_at,
    sportName: row.sport_id ? sportsById.get(row.sport_id) ?? null : null,
  }))
}

export async function loadMedia(): Promise<LiveMediaItem[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('media_items').select('*').eq('approval_status', 'approved').eq('visibility', 'public').order('captured_on', { ascending: false })
  if (error) throw error
  return Promise.all((data ?? []).map(async (row) => {
    let url = row.external_url ?? ''
    if (row.storage_path) {
      const { data: signed } = await client.storage.from('athletics-media').createSignedUrl(row.storage_path, 86400)
      url = signed?.signedUrl ?? ''
    }
    return { id: row.id, kind: row.kind, caption: row.caption, altText: row.alt_text, capturedOn: row.captured_on, url }
  }))
}

export async function loadHistory(): Promise<{ archives: LiveArchive[]; hallOfFame: LiveHallOfFameProfile[] }> {
  const client = requireSupabase()
  const [{ data: archiveRows, error }, { data: profileRows }, { data: sportRows }] = await Promise.all([
    client.from('archive_seasons').select('*').eq('status', 'published').order('school_year', { ascending: false }),
    client.from('hall_of_fame_profiles').select('*').eq('status', 'published').order('name'),
    client.from('sports').select('id, name'),
  ])
  if (error) throw error
  const sportsById = new Map((sportRows ?? []).map((row) => [row.id, row.name]))
  const hallOfFame = await Promise.all((profileRows ?? []).map(async (row) => {
    let photoUrl: string | null = null
    if (row.photo_path) {
      const { data: signed } = await client.storage.from('athletics-media').createSignedUrl(row.photo_path, 86400)
      photoUrl = signed?.signedUrl ?? null
    }
    return { id: row.id, name: row.name, yearsAttended: row.years_attended, biography: row.biography, notableAchievement: row.notable_achievement, photoUrl }
  }))
  return {
    archives: (archiveRows ?? []).map((row) => ({ id: row.id, schoolYear: row.school_year, teamName: row.team_name, ageGroup: row.age_group, writeUp: row.write_up, notableResults: row.notable_results, sportName: sportsById.get(row.sport_id) ?? 'Athletics' })),
    hallOfFame,
  }
}