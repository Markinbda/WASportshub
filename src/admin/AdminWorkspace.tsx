import { useEffect, useEffectEvent, useState, type FormEvent } from 'react'
import { Archive, CalendarDays, FileText, ImagePlus, LayoutDashboard, ListChecks, ShieldCheck, Trophy, UserPlus, Users } from 'lucide-react'
import { loadTeams, type LiveTeam } from '../lib/athletics'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'

type Tab = 'overview' | 'teams' | 'fixtures' | 'results' | 'rosters' | 'news' | 'media' | 'archive' | 'staff'
type Sport = Database['public']['Tables']['sports']['Row']
type Season = Database['public']['Tables']['seasons']['Row']
type Venue = Database['public']['Tables']['venues']['Row']
type Fixture = Database['public']['Tables']['fixtures']['Row']
type Result = Database['public']['Tables']['match_results']['Row']
type NewsPost = Database['public']['Tables']['news_posts']['Row']
type MediaItem = Database['public']['Tables']['media_items']['Row']
type ArchiveSeason = Database['public']['Tables']['archive_seasons']['Row']
type HallProfile = Database['public']['Tables']['hall_of_fame_profiles']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'fixtures', label: 'Fixtures', icon: CalendarDays },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'rosters', label: 'Rosters', icon: ListChecks },
  { id: 'news', label: 'News', icon: FileText },
  { id: 'media', label: 'Media', icon: ImagePlus },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'staff', label: 'Staff', icon: UserPlus },
]

function value(form: FormData, name: string) {
  return String(form.get(name) ?? '').trim()
}

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function AdminWorkspace({ userId, email, role, onSignOut }: { userId: string; email: string; role: 'coach' | 'editor' | 'admin'; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('overview')
  const [scopeType, setScopeType] = useState<'sport' | 'team'>('sport')
  const [teams, setTeams] = useState<LiveTeam[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [archives, setArchives] = useState<ArchiveSeason[]>([])
  const [hallProfiles, setHallProfiles] = useState<HallProfile[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const loadWorkspace = useEffectEvent(async () => {
    if (!supabase) return
    try {
      const [teamData, sportResult, seasonResult, venueResult, fixtureResult, resultResult, postResult, mediaResult, archiveResult, hallResult, staffResult] = await Promise.all([
        loadTeams(),
        supabase.from('sports').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('seasons').select('*').order('start_date', { ascending: false }),
        supabase.from('venues').select('*').eq('is_active', true).order('name'),
        supabase.from('fixtures').select('*').order('starts_at', { ascending: false }),
        supabase.from('match_results').select('*'),
        supabase.from('news_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('media_items').select('*').order('created_at', { ascending: false }),
        supabase.from('archive_seasons').select('*').order('school_year', { ascending: false }),
        supabase.from('hall_of_fame_profiles').select('*').order('name'),
        supabase.from('staff_profiles').select('*').order('display_name'),
      ])
      const firstError = [sportResult, seasonResult, venueResult, fixtureResult, resultResult, postResult, mediaResult, archiveResult, hallResult, staffResult].find((entry) => entry.error)?.error
      if (firstError) throw firstError
      setTeams(teamData)
      setSports(sportResult.data ?? [])
      setSeasons(seasonResult.data ?? [])
      setVenues(venueResult.data ?? [])
      setFixtures(fixtureResult.data ?? [])
      setResults(resultResult.data ?? [])
      setPosts(postResult.data ?? [])
      setMedia(mediaResult.data ?? [])
      setArchives(archiveResult.data ?? [])
      setHallProfiles(hallResult.data ?? [])
      setStaff(staffResult.data ?? [])
    } catch (error) {
      console.error('[AdminWorkspace]', error)
      setNotice(error instanceof Error ? error.message : 'The workspace could not be loaded.')
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadWorkspace() }, 0)
    return () => window.clearTimeout(timeout)
  }, [refreshKey])

  async function run(action: () => Promise<void>, success: string, form?: HTMLFormElement) {
    setWorking(true)
    setNotice('')
    try {
      await action()
      form?.reset()
      setNotice(success)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      console.error('[AdminWorkspace action]', error)
      setNotice(error instanceof Error ? error.message : 'The change could not be saved.')
    } finally {
      setWorking(false)
    }
  }

  function submitTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const name = value(form, 'name')
    void run(async () => {
      const { error } = await supabase!.from('teams').insert({
        name,
        slug: slugify(name),
        age_group: value(form, 'age_group'),
        description: value(form, 'description'),
        sport_id: value(form, 'sport_id'),
        season_id: value(form, 'season_id'),
        home_venue_id: value(form, 'venue_id') || null,
        roster_name_mode: value(form, 'roster_name_mode') as 'first_and_initial' | 'full_name',
      })
      if (error) throw error
    }, 'Team created.', formElement)
  }

  function submitFixture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    void run(async () => {
      const { error } = await supabase!.from('fixtures').insert({
        team_id: value(form, 'team_id'),
        opponent_name: value(form, 'opponent_name'),
        starts_at: new Date(value(form, 'starts_at')).toISOString(),
        venue_id: value(form, 'venue_id') || null,
        external_venue: value(form, 'external_venue') || null,
        home_away: value(form, 'home_away') as 'home' | 'away' | 'neutral',
        status: value(form, 'status') as 'draft' | 'scheduled',
        notes: value(form, 'notes') || null,
        created_by: userId,
      })
      if (error) throw error
    }, 'Fixture created.', formElement)
  }

  function submitResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const fixtureId = value(form, 'fixture_id')
    void run(async () => {
      const teamScore = Number(value(form, 'team_score'))
      const opponentScore = Number(value(form, 'opponent_score'))
      const outcome = teamScore > opponentScore ? 'win' : teamScore < opponentScore ? 'loss' : 'draw'
      const { error } = await supabase!.from('match_results').upsert({ fixture_id: fixtureId, team_score: teamScore, opponent_score: opponentScore, outcome, summary: value(form, 'summary') || null, recorded_by: userId }, { onConflict: 'fixture_id' })
      if (error) throw error
      const { error: fixtureError } = await supabase!.from('fixtures').update({ status: 'completed' }).eq('id', fixtureId)
      if (fixtureError) throw fixtureError
    }, 'Result published.', formElement)
  }

  function submitRoster(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    void run(async () => {
      const { error } = await supabase!.rpc('add_roster_member', {
        target_team_id: value(form, 'team_id'),
        first_name: value(form, 'first_name'),
        last_name: value(form, 'last_name'),
        graduation_year: value(form, 'graduation_year') ? Number(value(form, 'graduation_year')) : undefined,
        jersey_number: value(form, 'jersey_number') || undefined,
        player_role: value(form, 'position') || undefined,
        is_captain: form.get('is_captain') === 'on',
      })
      if (error) throw error
    }, 'Student added to roster.', formElement)
  }

  function submitNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const title = value(form, 'title')
    const status = value(form, 'status') as 'draft' | 'published'
    void run(async () => {
      const { error } = await supabase!.from('news_posts').insert({ title, slug: `${slugify(title)}-${Date.now().toString(36)}`, summary: value(form, 'summary'), body: value(form, 'body'), sport_id: value(form, 'sport_id') || null, status, published_at: status === 'published' ? new Date().toISOString() : null, author_id: userId })
      if (error) throw error
    }, status === 'published' ? 'Story published.' : 'Draft saved.', formElement)
  }

  function submitMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    void run(async () => {
      const teamId = value(form, 'team_id')
      const file = form.get('file') as File
      const externalUrl = value(form, 'external_url')
      let storagePath: string | null = null
      let kind: 'photo' | 'youtube' | 'vimeo' = 'photo'
      if (file?.size) {
        storagePath = `${teamId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
        const { error: uploadError } = await supabase!.storage.from('athletics-media').upload(storagePath, file)
        if (uploadError) throw uploadError
      } else {
        kind = externalUrl.includes('vimeo') ? 'vimeo' : 'youtube'
      }
      const { data: item, error } = await supabase!.from('media_items').insert({ kind, storage_path: storagePath, external_url: storagePath ? null : externalUrl, caption: value(form, 'caption'), alt_text: value(form, 'alt_text'), captured_on: value(form, 'captured_on') || null, consent_confirmed: form.get('consent_confirmed') === 'on', uploaded_by: userId }).select('id').single()
      if (error) throw error
      const { error: linkError } = await supabase!.from('media_teams').insert({ media_id: item.id, team_id: teamId })
      if (linkError) throw linkError
    }, 'Media submitted for approval.', formElement)
  }

  function moderateMedia(itemId: string, approved: boolean) {
    void run(async () => {
      const { error } = await supabase!.from('media_items').update({ approval_status: approved ? 'approved' : 'rejected', visibility: approved ? 'public' : 'internal', approved_by: approved ? userId : null, approved_at: approved ? new Date().toISOString() : null, rejection_reason: approved ? null : 'Not approved for publication.' }).eq('id', itemId)
      if (error) throw error
    }, approved ? 'Media approved.' : 'Media rejected.')
  }

  function inviteStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    void run(async () => {
      const { data } = await supabase!.auth.getSession()
      if (!data.session) throw new Error('Your session has expired.')
      const response = await fetch('/.netlify/functions/admin-invite', {
        method: 'POST',
        headers: { authorization: `Bearer ${data.session.access_token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ email: value(form, 'email'), displayName: value(form, 'display_name'), role: value(form, 'role') }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'The invitation could not be sent.')
    }, 'Staff invitation sent.', formElement)
  }

  function assignScope(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const scopeType = value(form, 'scope_type')
    void run(async () => {
      const { error } = await supabase!.from('staff_scopes').insert({ staff_user_id: value(form, 'staff_user_id'), sport_id: scopeType === 'sport' ? value(form, 'scope_id') : null, team_id: scopeType === 'team' ? value(form, 'scope_id') : null })
      if (error) throw error
    }, 'Coach scope assigned.', formElement)
  }

  function submitArchive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    void run(async () => {
      const { error } = await supabase!.from('archive_seasons').insert({ sport_id: value(form, 'sport_id'), school_year: value(form, 'school_year'), team_name: value(form, 'team_name'), age_group: value(form, 'age_group') || null, write_up: value(form, 'write_up'), notable_results: value(form, 'notable_results'), status: value(form, 'status') as 'draft' | 'published' })
      if (error) throw error
    }, 'Archive season saved.', formElement)
  }

  function submitHallProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    void run(async () => {
      const { data: profile, error } = await supabase!.from('hall_of_fame_profiles').insert({ name: value(form, 'name'), years_attended: value(form, 'years_attended') || null, biography: value(form, 'biography'), notable_achievement: value(form, 'notable_achievement'), status: value(form, 'status') as 'draft' | 'published' }).select('id').single()
      if (error) throw error
      const { error: sportError } = await supabase!.from('hall_of_fame_sports').insert({ profile_id: profile.id, sport_id: value(form, 'sport_id') })
      if (sportError) throw sportError
    }, 'Hall of Fame profile saved.', formElement)
  }

  const editable = role === 'editor' || role === 'admin'
  const fixtureName = (fixture?: Fixture) => fixture ? `${teams.find((team) => team.id === fixture.team_id)?.name ?? 'Team'} vs ${fixture.opponent_name}` : 'Archived fixture'
  return <div className="admin-workspace">
    <div className="admin-toolbar"><div><p className="eyebrow">Staff workspace</p><h1>Athletics dashboard</h1><small>{email} · {role}</small></div><button className="button button-dark" onClick={onSignOut}>Sign out</button></div>
    <div className="admin-layout"><nav className="admin-tabs" aria-label="Management modules">{tabs.filter((item) => (item.id !== 'staff' || role === 'admin') && (editable || !['teams', 'news', 'archive'].includes(item.id))).map(({ id, label, icon: Icon }) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><Icon size={17} />{label}</button>)}</nav><section className="admin-panel">
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading ? <div className="admin-empty">Loading workspace…</div> : <>
        {tab === 'overview' && <><div className="admin-metrics"><div><strong>{teams.length}</strong><span>Active teams</span></div><div><strong>{fixtures.filter((item) => item.status === 'scheduled').length}</strong><span>Upcoming fixtures</span></div><div><strong>{results.length}</strong><span>Published results</span></div><div><strong>{media.filter((item) => item.approval_status === 'pending').length}</strong><span>Media awaiting review</span></div></div><div className="admin-callout"><ShieldCheck /><div><h2>Access is enforced by Supabase</h2><p>Your {role} role and assigned sport/team scopes determine which records can be changed.</p></div></div></>}
        {tab === 'teams' && <AdminSection title="Create team" description="Add a squad to an existing sport and season."><form className="admin-form" onSubmit={submitTeam}><label>Team name<input name="name" required /></label><label>Age group<input name="age_group" required /></label><label>Sport<select name="sport_id" required>{sports.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Season<select name="season_id" required>{seasons.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Home venue<select name="venue_id"><option value="">No home venue</option>{venues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Public roster names<select name="roster_name_mode"><option value="first_and_initial">First name + initial</option><option value="full_name">Full name</option></select></label><label className="wide">Description<textarea name="description" rows={3} /></label><SubmitButton working={working}>Create team</SubmitButton></form><AdminList>{teams.map((item) => <li key={item.id}><strong>{item.name}</strong><span>{item.sportName} · {item.schoolYear}</span></li>)}</AdminList></AdminSection>}
        {tab === 'fixtures' && <AdminSection title="Schedule fixture" description="Publish a fixture immediately or save it as a draft."><form className="admin-form" onSubmit={submitFixture}><TeamSelect teams={teams} /><label>Opponent<input name="opponent_name" required /></label><label>Starts<input name="starts_at" type="datetime-local" required /></label><label>Venue<select name="venue_id"><option value="">External / TBC</option>{venues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>External venue<input name="external_venue" /></label><label>Home / away<select name="home_away"><option value="home">Home</option><option value="away">Away</option><option value="neutral">Neutral</option></select></label><label>Status<select name="status"><option value="scheduled">Published</option><option value="draft">Draft</option></select></label><label className="wide">Notes<textarea name="notes" rows={2} /></label><SubmitButton working={working}>Save fixture</SubmitButton></form><AdminList>{fixtures.slice(0, 12).map((item) => <li key={item.id}><strong>{fixtureName(item)}</strong><span>{new Date(item.starts_at).toLocaleString('en-BM')} · {item.status}</span></li>)}</AdminList></AdminSection>}
        {tab === 'results' && <AdminSection title="Publish result" description="Recording a score marks the fixture as completed."><form className="admin-form" onSubmit={submitResult}><label className="wide">Fixture<select name="fixture_id" required>{fixtures.map((item) => <option value={item.id} key={item.id}>{fixtureName(item)}</option>)}</select></label><label>Warwick score<input name="team_score" type="number" step="any" required /></label><label>Opponent score<input name="opponent_score" type="number" step="any" required /></label><label className="wide">Summary<textarea name="summary" rows={3} /></label><SubmitButton working={working}>Publish result</SubmitButton></form><AdminList>{results.map((item) => <li key={item.id}><strong>{fixtureName(fixtures.find((fixture) => fixture.id === item.fixture_id)!)}</strong><span>{item.team_score}–{item.opponent_score} · {item.outcome}</span></li>)}</AdminList></AdminSection>}
        {tab === 'rosters' && <AdminSection title="Add roster member" description="Names are displayed publicly according to the selected team’s privacy setting."><form className="admin-form" onSubmit={submitRoster}><TeamSelect teams={teams} /><label>First name<input name="first_name" required /></label><label>Last name<input name="last_name" required /></label><label>Graduation year<input name="graduation_year" type="number" min="2026" max="2045" /></label><label>Jersey number<input name="jersey_number" /></label><label>Position / role<input name="position" /></label><label className="check-field"><input name="is_captain" type="checkbox" /> Team captain</label><SubmitButton working={working}>Add to roster</SubmitButton></form></AdminSection>}
        {tab === 'news' && <AdminSection title="Publish news" description="Stories appear on the public homepage once published."><form className="admin-form" onSubmit={submitNews}><label className="wide">Title<input name="title" required /></label><label>Sport<select name="sport_id"><option value="">Whole programme</option>{sports.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Status<select name="status"><option value="published">Published</option><option value="draft">Draft</option></select></label><label className="wide">Summary<textarea name="summary" rows={2} required /></label><label className="wide">Story<textarea name="body" rows={8} required /></label><SubmitButton working={working}>Save story</SubmitButton></form><AdminList>{posts.map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.status} · {new Date(item.created_at).toLocaleDateString('en-BM')}</span></li>)}</AdminList></AdminSection>}
        {tab === 'media' && <AdminSection title="Media library" description="Upload a consent-cleared photo or link a YouTube/Vimeo video."><form className="admin-form" onSubmit={submitMedia}><TeamSelect teams={teams} /><label>Photo<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label><label className="wide">Video URL<input name="external_url" type="url" placeholder="YouTube or Vimeo (when no photo is selected)" /></label><label>Caption<input name="caption" required /></label><label>Alt text<input name="alt_text" required /></label><label>Captured on<input name="captured_on" type="date" /></label><label className="check-field"><input name="consent_confirmed" type="checkbox" required /> Publication consent confirmed</label><SubmitButton working={working}>Submit media</SubmitButton></form><AdminList>{media.map((item) => <li key={item.id}><strong>{item.caption || 'Untitled media'}</strong><span>{item.kind} · {item.approval_status}</span>{editable && item.approval_status === 'pending' && <span className="row-actions"><button onClick={() => moderateMedia(item.id, true)}>Approve</button><button onClick={() => moderateMedia(item.id, false)}>Reject</button></span>}</li>)}</AdminList></AdminSection>}
        {tab === 'archive' && <AdminSection title="History and Hall of Fame" description="Publish past seasons and recognise outstanding Warwick athletes."><h3 className="admin-form-heading">Add archive season</h3><form className="admin-form" onSubmit={submitArchive}><label>Sport<select name="sport_id" required>{sports.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>School year<input name="school_year" placeholder="2016–17" required /></label><label>Team name<input name="team_name" required /></label><label>Age group<input name="age_group" /></label><label className="wide">Season write-up<textarea name="write_up" rows={4} required /></label><label className="wide">Notable results<textarea name="notable_results" rows={2} /></label><label>Status<select name="status"><option value="published">Published</option><option value="draft">Draft</option></select></label><SubmitButton working={working}>Save season</SubmitButton></form><h3 className="admin-form-heading">Add Hall of Fame profile</h3><form className="admin-form" onSubmit={submitHallProfile}><label>Name<input name="name" required /></label><label>Years attended<input name="years_attended" /></label><label>Sport<select name="sport_id" required>{sports.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Status<select name="status"><option value="published">Published</option><option value="draft">Draft</option></select></label><label className="wide">Notable achievement<textarea name="notable_achievement" rows={2} required /></label><label className="wide">Biography<textarea name="biography" rows={5} required /></label><SubmitButton working={working}>Save profile</SubmitButton></form><AdminList>{archives.map((item) => <li key={item.id}><strong>{item.school_year}: {item.team_name}</strong><span>{item.status}</span></li>)}{hallProfiles.map((item) => <li key={item.id}><strong>{item.name}</strong><span>Hall of Fame · {item.status}</span></li>)}</AdminList></AdminSection>}
        {tab === 'staff' && role === 'admin' && <AdminSection title="Staff access" description="Invite staff and assign coaches to the sports or teams they manage."><h3 className="admin-form-heading">Invite staff</h3><form className="admin-form" onSubmit={inviteStaff}><label>Display name<input name="display_name" required /></label><label>Email address<input name="email" type="email" required /></label><label>Role<select name="role"><option value="coach">Coach</option><option value="editor">Editor</option><option value="admin">Administrator</option></select></label><SubmitButton working={working}>Send invitation</SubmitButton></form><h3 className="admin-form-heading">Assign coach scope</h3><form className="admin-form" onSubmit={assignScope}><label>Staff member<select name="staff_user_id" required>{staff.filter((item) => item.role === 'coach').map((item) => <option value={item.user_id} key={item.user_id}>{item.display_name}</option>)}</select></label><label>Scope type<select name="scope_type" value={scopeType} onChange={(event) => setScopeType(event.target.value as 'sport' | 'team')}><option value="sport">Sport</option><option value="team">Team</option></select></label><label>{scopeType === 'sport' ? 'Sport' : 'Team'}<select name="scope_id" required>{scopeType === 'sport' ? sports.map((item) => <option value={item.id} key={item.id}>{item.name}</option>) : teams.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><SubmitButton working={working}>Assign scope</SubmitButton></form><AdminList>{staff.map((item) => <li key={item.user_id}><strong>{item.display_name}</strong><span>{item.email} · {item.role} · {item.is_active ? 'active' : 'inactive'}</span></li>)}</AdminList></AdminSection>}
      </>}
    </section></div>
  </div>
}

function AdminSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <div className="admin-section"><header><h2>{title}</h2><p>{description}</p></header>{children}</div> }
function TeamSelect({ teams }: { teams: LiveTeam[] }) { return <label>Team<select name="team_id" required>{teams.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label> }
function SubmitButton({ working, children }: { working: boolean; children: React.ReactNode }) { return <button className="button button-primary" disabled={working}>{working ? 'Saving…' : children}</button> }
function AdminList({ children }: { children: React.ReactNode }) { return <ul className="admin-record-list">{children}</ul> }