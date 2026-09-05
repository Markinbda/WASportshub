import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ArrowRight, CalendarDays, ChevronDown, Clock3, LockKeyhole, MapPin, Menu, Search, ShieldCheck, Trophy, Users, X } from 'lucide-react'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { AdminWorkspace } from './admin/AdminWorkspace'
import { sports } from './lib/data'
import { downloadFixtureCalendar } from './lib/calendar'
import { loadFixtures, loadHistory, loadMedia, loadNews, loadPublicRoster, loadTeams, type LiveFixture, type LiveMediaItem } from './lib/athletics'
import { supabase } from './lib/supabase'
import { useAsyncResource } from './lib/useAsyncResource'
import './App.css'

const navItems = [['Sports', '/sports'], ['Teams', '/teams'], ['Results', '/results'], ['Calendar', '/calendar'], ['Gallery', '/gallery'], ['History', '/history']]

function Mark() {
  return <img className="brand-mark" src="/warwick-bears-logo.png" alt="" aria-hidden="true" />
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="site-shell">
    <header className="site-header"><div className="header-inner">
      <Link className="brand" to="/" onClick={() => setMenuOpen(false)}><Mark /><span className="brand-copy"><strong>Warwick Bears</strong><small>Athletics Hub</small></span></Link>
      <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        {navItems.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}
        <NavLink className="staff-link" to="/admin" onClick={() => setMenuOpen(false)}><LockKeyhole size={15} /> Staff</NavLink>
      </nav>
    </div></header>
    <main><Routes>
      <Route path="/" element={<HomePage />} /><Route path="/sports" element={<SportsPage />} /><Route path="/sports/:slug" element={<SportPage />} />
      <Route path="/teams" element={<TeamsPage />} /><Route path="/results" element={<ResultsPage />} /><Route path="/calendar" element={<CalendarPage />} />
      <Route path="/gallery" element={<GalleryPage />} /><Route path="/history" element={<HistoryPage />} /><Route path="/news/:slug" element={<NewsArticlePage />} /><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<NotFound />} />
    </Routes></main><Footer />
  </div>
}

function HomePage() {
  const { data: liveFixtures } = useAsyncResource(loadFixtures, [])
  const { data: liveNews } = useAsyncResource(loadNews, [])
  const { data: liveMedia } = useAsyncResource(loadMedia, [])
  const upcoming = liveFixtures.filter((item) => item.status === 'scheduled' && new Date(item.startsAt) >= new Date()).slice(0, 3)
  const completed = liveFixtures.filter((item) => item.status === 'completed' && item.result)
  const wins = completed.filter((item) => item.result?.outcome === 'win').length
  return <>
    <section className="hero-banner">
      <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=2000&q=90" alt="Football players competing on a floodlit field" />
      <div className="hero-overlay" /><div className="hero-content page-width"><p className="eyebrow light">Warwick Academy Athletics</p><h1>Warwick Bears</h1><p className="hero-lead">Every team. Every result. One proud school community.</p><div className="hero-actions"><Link className="button button-primary" to="/sports">Explore our sports <ArrowRight size={17} /></Link><Link className="button button-ghost" to="/calendar">View the calendar</Link></div></div>
      <div className="hero-caption page-width"><span>Season spotlight</span> High-Performance Football begins its autumn programme</div>
    </section>
    <section className="week-strip"><div className="page-width week-inner"><div className="section-label"><CalendarDays size={20} /><span><strong>Coming up</strong><small>Upcoming fixtures</small></span></div><div className="fixture-scroll">{upcoming.length ? upcoming.map((fixture) => <LiveFixtureMini key={fixture.id} fixture={fixture} />) : <span className="schedule-empty">The next fixtures will appear here when published.</span>}</div><Link className="text-link" to="/calendar">Full calendar <ArrowRight size={16} /></Link></div></section>
    <section className="section page-width"><SectionHeading eyebrow="Find your team" title="Built for every Bear" description="From first fixtures to high-performance programmes, Warwick athletes have room to grow." link="/sports" linkText="All sports" /><div className="sport-grid featured-sports">{sports.filter((sport) => sport.category === 'primary').slice(0, 6).map((sport) => <SportCard key={sport.slug} sport={sport} />)}</div></section>
    <section className="section section-ink"><div className="page-width performance-grid"><div><p className="eyebrow gold">Performance snapshot</p><h2>A season taking shape.</h2><p>Published results from across Warwick Academy sport.</p><Link className="button button-outline" to="/results">Explore results <ArrowRight size={17} /></Link></div><div className="stat-grid"><div><strong>{completed.length}</strong><span>Results recorded</span></div><div><strong>{wins}</strong><span>Warwick wins</span></div><div><strong>{completed.length ? Math.round((wins / completed.length) * 100) : 0}%</strong><span>Win rate</span></div><div><strong>{new Set(liveFixtures.map((item) => item.teamId)).size}</strong><span>Teams on schedule</span></div></div></div></section>
    <section className="section page-width"><SectionHeading eyebrow="From the sidelines" title="Latest galleries" description="Training, competition and the moments that bring our community together." link="/gallery" linkText="View gallery" />{liveMedia.length ? <LiveGalleryGrid items={liveMedia.slice(0, 4)} /> : <EmptyState text="Approved athletics media will appear here." />}</section>
    <section className="section news-section"><div className="page-width"><SectionHeading eyebrow="Bear news" title="Around the programme" description="Stories and updates from Warwick Academy athletics." />{liveNews.length ? <div className="news-grid">{liveNews.slice(0, 3).map((item) => <article className="news-item" key={item.id}><p className="meta">{item.sportName ?? 'Athletics'} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-BM', { month: 'long', day: 'numeric' }) : 'News'}</p><h3>{item.title}</h3><p>{item.summary}</p><Link className="read-more" to={`/news/${item.slug}`}>Read story <ArrowRight size={15} /></Link></article>)}</div> : <EmptyState text="Published athletics stories will appear here." />}</div></section>
  </>
}

function SportsPage() {
  const [showMore, setShowMore] = useState(false)
  const [displaySports, setDisplaySports] = useState(sports)

  useEffect(() => {
    if (!supabase) return
    let active = true
    async function loadSports() {
      try {
        const { data, error } = await supabase!.from('sports').select('name, slug, description, category').eq('is_active', true).order('sort_order')
        if (error) console.error('[SportsPage]', error)
        if (active && data) {
          const merged = data.map((row) => {
            const local = sports.find((item) => item.slug === row.slug)
            return local ? { ...local, name: row.name, description: row.description } : null
          }).filter((sport): sport is (typeof sports)[number] => sport !== null)
          if (merged.length) setDisplaySports(merged)
        }
      } catch (error) {
        console.error('[SportsPage] threw', error)
      }
    }
    void loadSports()
    return () => { active = false }
  }, [])

  const primary = displaySports.filter((sport) => sport.category === 'primary')
  const secondary = displaySports.filter((sport) => sport.category === 'secondary')
  const privateSports = displaySports.filter((sport) => sport.category === 'private')
  return <PageFrame eyebrow="Our programme" title="Sports at Warwick" intro="Competitive pathways, active opportunities and specialist programmes for students across the school.">
    <div className="sport-grid">{primary.map((sport) => <SportCard key={sport.slug} sport={sport} />)}</div>
    <button className="disclosure" onClick={() => setShowMore(!showMore)} aria-expanded={showMore}><span><strong>Also offered</strong><small>{secondary.length} activity sports</small></span><ChevronDown className={showMore ? 'rotated' : ''} /></button>
    {showMore && <div className="activity-grid">{secondary.map((sport) => <SportCard compact key={sport.slug} sport={sport} />)}</div>}
    <div className="private-programmes"><div><p className="eyebrow">Private sessions</p><h2>Specialist programmes</h2></div>{privateSports.map((sport) => <div className="private-item" key={sport.slug}><span>{sport.icon}</span><strong>{sport.name}</strong><small>Enquire through Athletics</small></div>)}</div>
  </PageFrame>
}

function SportPage() {
  const { slug } = useParams()
  const sport = sports.find((item) => item.slug === slug)
  const { data: liveTeams } = useAsyncResource(loadTeams, [])
  const { data: liveFixtures } = useAsyncResource(loadFixtures, [])
  if (!sport) return <NotFound />
  const sportTeams = liveTeams.filter((item) => item.sportSlug === sport.slug)
  const sportFixtures = liveFixtures.filter((item) => item.sportSlug === sport.slug && item.status === 'scheduled')
  return <><section className="sport-hero" style={{ '--sport-accent': sport.accent } as React.CSSProperties}><div className="page-width sport-hero-inner"><div className="sport-symbol">{sport.icon}</div><div><p className="eyebrow light">Warwick Bears sport</p><h1>{sport.name}</h1><p>{sport.description}</p></div>{sport.record && <div className="record-pill"><small>Programme</small><strong>{sportTeams.length} teams</strong></div>}</div></section><div className="section page-width two-column"><div><p className="eyebrow">Current season</p><h2>Teams</h2><div className="team-list">{sportTeams.length ? sportTeams.map((team) => <Link to={`/teams?team=${team.id}`} key={team.id}><span><Users size={18} /> {team.name}</span><ArrowRight size={17} /></Link>) : <EmptyState text="Current teams will appear here once published." />}</div></div><div><p className="eyebrow">Coming up</p><h2>Next fixtures</h2><div className="fixture-list">{sportFixtures.length ? sportFixtures.slice(0, 5).map((fixture) => <LiveFixtureMini key={fixture.id} fixture={fixture} />) : <EmptyState text="Fixtures will appear here when the schedule is published." />}</div></div></div></>
}

function NewsArticlePage() { const { slug } = useParams(); const { data, loading, error } = useAsyncResource(loadNews, []); const article = data.find((item) => item.slug === slug); if (loading) return <PageFrame eyebrow="Bear news" title="Loading story" intro="Retrieving the latest from Warwick Athletics."><LoadingState text="Loading story…" /></PageFrame>; if (error || !article) return <NotFound />; return <><section className="page-intro"><div className="page-width"><p className="eyebrow gold">{article.sportName ?? 'Warwick Athletics'}</p><h1>{article.title}</h1><p>{article.summary}</p></div></section><article className="article-body page-width"><p className="article-date">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-BM', { dateStyle: 'long' }) : ''}</p>{article.body.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article></> }

function TeamsPage() {
  const { data: teams, loading, error } = useAsyncResource(loadTeams, [])
  const [teamId, setTeamId] = useState('')
  const selectedTeam = teams.find((item) => item.id === teamId) ?? teams[0]
  const { data: members, loading: rosterLoading } = useAsyncResource(() => selectedTeam ? loadPublicRoster(selectedTeam.id) : Promise.resolve([]), [], selectedTeam?.id)
  return <PageFrame eyebrow="Meet the Bears" title="Team rosters" intro="Browse current squads by sport, age group and season.">
    {loading && <LoadingState text="Loading teams…" />}
    {error && <ErrorState text="Teams could not be loaded." />}
    {!loading && !teams.length && <EmptyState text="Teams will appear here once the current season is published." />}
    {selectedTeam && <><FilterBar><label>Team<select value={selectedTeam.id} onChange={(event) => setTeamId(event.target.value)}>{teams.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Season<select value={selectedTeam.schoolYear} disabled><option>{selectedTeam.schoolYear}</option></select></label></FilterBar><div className="team-heading"><div><p className="eyebrow">{selectedTeam.schoolYear} squad</p><h2>{selectedTeam.name}</h2><p>{selectedTeam.sportName}{selectedTeam.venueName ? ` · ${selectedTeam.venueName}` : ''}</p></div></div>{rosterLoading ? <LoadingState text="Loading roster…" /> : members.length ? <div className="roster-grid">{members.map((player) => <div className="roster-card" key={player.membershipId}><span className="jersey">{player.jerseyNumber ?? '—'}</span><div><strong>{player.displayName}</strong><small>{player.isCaptain ? `Captain${player.playerRole ? ` · ${player.playerRole}` : ''}` : player.playerRole ?? 'Squad member'}</small></div></div>)}</div> : <EmptyState text="No public roster has been published for this team." />}<p className="privacy-note"><ShieldCheck size={17} /> Student names are displayed according to the team’s approved privacy setting.</p></>}
  </PageFrame>
}

function ResultsPage() {
  const { data: allFixtures, loading, error } = useAsyncResource(loadFixtures, [])
  const completed = allFixtures.filter((fixture) => fixture.status === 'completed' && fixture.result).reverse()
  const wins = completed.filter((fixture) => fixture.result?.outcome === 'win').length
  const draws = completed.filter((fixture) => fixture.result?.outcome === 'draw').length
  return <PageFrame eyebrow="Records & results" title="The season in numbers" intro="Latest scores and match outcomes across Warwick Bears teams.">{loading && <LoadingState text="Loading results…" />}{error && <ErrorState text="Results could not be loaded." />}{!loading && <><div className="result-summary"><div><Trophy /><strong>{completed.length}</strong><span>Results recorded</span></div><div><Trophy /><strong>{wins}</strong><span>Wins</span></div><div><Trophy /><strong>{draws}</strong><span>Draws</span></div><div><Trophy /><strong>{new Set(completed.map((item) => item.teamId)).size}</strong><span>Teams reporting</span></div></div><h2 className="subheading">Recent results</h2>{completed.length ? <div className="results-table" role="table" aria-label="Recent results">{completed.map((fixture) => <div className="result-row" role="row" key={fixture.id}><span className="result-date">{formatShortDate(fixture.startsAt)}</span><strong>{fixture.teamName}</strong><span>vs {fixture.opponentName}</span><b>{fixture.result?.teamScore ?? '—'} – {fixture.result?.opponentScore ?? '—'}</b><i className={`outcome outcome-${outcomeLetter(fixture).toLowerCase()}`}>{outcomeLetter(fixture)}</i></div>)}</div> : <EmptyState text="Completed results will appear here after they are published." />}</>}</PageFrame>
}

function CalendarPage() {
  const [sport, setSport] = useState('All sports')
  const { data: allFixtures, loading, error } = useAsyncResource(loadFixtures, [])
  const sportNames = [...new Set(allFixtures.map((item) => item.sportName))]
  const visible = allFixtures.filter((item) => item.status !== 'completed' && (sport === 'All sports' || item.sportName === sport))
  return <PageFrame eyebrow="Events calendar" title="What’s happening" intro="Fixtures, meets and competitions across every Warwick Bears team."><FilterBar><label>Sport<select value={sport} onChange={(event) => setSport(event.target.value)}><option>All sports</option>{sportNames.map((name) => <option key={name}>{name}</option>)}</select></label><button className="button button-dark" disabled={!visible.length} onClick={() => downloadFixtureCalendar(visible)}>Download calendar</button></FilterBar>{loading && <LoadingState text="Loading fixtures…" />}{error && <ErrorState text="Fixtures could not be loaded." />}<div className="calendar-list">{visible.map((fixture) => { const date = new Date(fixture.startsAt); return <div className="calendar-item" key={fixture.id}><div className="date-block"><strong>{date.toLocaleDateString('en-BM', { day: '2-digit' })}</strong><span>{date.toLocaleDateString('en-BM', { month: 'short' }).toUpperCase()}</span></div><div className="calendar-copy"><span className="sport-tag">{fixture.sportName}</span><h3>{fixture.teamName} <small>vs</small> {fixture.opponentName}</h3><p><Clock3 size={15} /> {date.toLocaleTimeString('en-BM', { hour: 'numeric', minute: '2-digit' })} <MapPin size={15} /> {fixture.venueName}</p></div><button className="icon-button" aria-label={`Add ${fixture.teamName} fixture to calendar`} onClick={() => downloadFixtureCalendar([fixture], `${fixture.teamName.toLowerCase().replaceAll(' ', '-')}.ics`)}><CalendarDays /></button></div> })}</div>{!loading && !visible.length && <EmptyState text="No upcoming fixtures match this filter." />}<ReminderSignup fixtures={allFixtures} /></PageFrame>
}

function GalleryPage() { const { data, loading, error } = useAsyncResource(loadMedia, []); return <PageFrame eyebrow="Photo & video" title="Bear moments" intro="A view from training grounds, courts, fields and competition days.">{loading && <LoadingState text="Loading gallery…" />}{error && <ErrorState text="The gallery could not be loaded." />}{data.length ? <LiveGalleryGrid items={data} /> : !loading && <EmptyState text="Approved photos and videos will appear here." />}</PageFrame> }

function HistoryPage() { const { data, loading, error } = useAsyncResource(loadHistory, { archives: [], hallOfFame: [] }); return <PageFrame eyebrow="History & archive" title="Built over generations" intro="Celebrating the teams, athletes and achievements that shaped Warwick Academy sport.">{loading && <LoadingState text="Loading the archive…" />}{error && <ErrorState text="The archive could not be loaded." />}{data.archives.length ? <div className="archive-list">{data.archives.map((item) => <article className="archive-banner" key={item.id}><div><p className="eyebrow gold">{item.sportName}</p><h2>{item.schoolYear}: {item.teamName}</h2><p>{item.writeUp}</p>{item.notableResults && <strong>{item.notableResults}</strong>}</div><span className="archive-year">{item.schoolYear.slice(-2)}</span></article>)}</div> : !loading && <EmptyState text="Published seasons will appear in the archive." />}<div className="hall-heading"><p className="eyebrow">Hall of fame</p><h2>Outstanding Bears</h2></div>{data.hallOfFame.length ? <div className="hall-grid">{data.hallOfFame.map((profile) => <article className="hall-card" key={profile.id}>{profile.photoUrl && <img src={profile.photoUrl} alt={profile.name} />}<div><small>{profile.yearsAttended}</small><h3>{profile.name}</h3><strong>{profile.notableAchievement}</strong><p>{profile.biography}</p></div></article>)}</div> : !loading && <EmptyState text="Hall of Fame profiles are being prepared by the Athletics team." />}</PageFrame> }

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [message, setMessage] = useState(''), [working, setWorking] = useState(false)
  const [staffRole, setStaffRole] = useState<'coach' | 'editor' | 'admin' | null | undefined>(undefined)
  useEffect(() => { if (!supabase) return; let mounted = true; const sessionPromise = supabase.auth.getSession().then(({ data }) => data.session).catch((error) => { console.error('[AdminPage getSession]', error); return null }); const timeout = new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3000)); void Promise.race([sessionPromise, timeout]).then((next) => { if (mounted) setSession(next) }); const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setStaffRole(undefined) }); return () => { mounted = false; data.subscription.unsubscribe() } }, [])
  useEffect(() => {
    if (!supabase || !session?.user) return
    let active = true
    async function loadStaffAccess() {
      try {
        const { data, error } = await supabase!.from('staff_profiles').select('role, is_active').eq('user_id', session!.user.id).maybeSingle()
        if (error) console.error('[AdminPage]', error)
        if (active) setStaffRole(data?.is_active ? data.role : null)
      } catch (error) {
        console.error('[AdminPage] threw', error)
        if (active) setStaffRole(null)
      }
    }
    void loadStaffAccess()
    return () => { active = false }
  }, [session])
  async function signIn(event: FormEvent) { event.preventDefault(); if (!supabase) return setMessage('Supabase configuration is not available.'); setWorking(true); try { const { error } = await supabase.auth.signInWithPassword({ email, password }); setMessage(error?.message ?? '') } catch { setMessage('Sign in could not be completed.') } finally { setWorking(false) } }
  if (session && staffRole === undefined) return <PageFrame eyebrow="Staff workspace" title="Checking access" intro="Confirming your Athletics Hub role."><div className="empty-state"><LockKeyhole /><p>Please wait…</p></div></PageFrame>
  if (session && !staffRole) return <PageFrame eyebrow="Access restricted" title="Staff role required" intro="Your account is signed in but has not been assigned an Athletics Hub role."><button className="button button-dark" onClick={() => void supabase?.auth.signOut()}>Sign out</button></PageFrame>
  if (session && staffRole) return <AdminWorkspace userId={session.user.id} email={session.user.email ?? 'Staff member'} role={staffRole} onSignOut={() => void supabase?.auth.signOut()} />
  return <div className="auth-page"><div className="auth-panel"><Link className="brand" to="/"><Mark /><span className="brand-copy"><strong>Warwick Bears</strong><small>Athletics Hub</small></span></Link><div className="auth-copy"><p className="eyebrow gold">Staff access</p><h1>Manage the programme.</h1><p>For authorised coaches and Athletics staff. Public visitors do not need an account.</p></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={signIn}><LockKeyhole size={26} /><h2>Staff sign in</h2><p>Use your Warwick Academy account.</p><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{message && <p className="form-message" role="alert">{message}</p>}<button className="button button-primary full" disabled={working}>{working ? 'Signing in…' : 'Sign in'}</button><Link to="/">Return to public site</Link></form></div></div>
}

function SportCard({ sport, compact = false }: { sport: (typeof sports)[number]; compact?: boolean }) { return <Link className={compact ? 'sport-card compact' : 'sport-card'} to={`/sports/${sport.slug}`} aria-label={`View ${sport.name}`} style={{ '--sport-accent': sport.accent } as React.CSSProperties}>{!compact && <img className="sport-photo" src={`/sport-tiles/${sport.slug}.jpg`} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />}<span className="sport-icon">{sport.icon}</span><div><h3>{sport.name}</h3>{!compact && <p>{sport.description}</p>}</div><ArrowRight className="card-arrow" /></Link> }
function LiveFixtureMini({ fixture }: { fixture: LiveFixture }) { const date = new Date(fixture.startsAt); return <div className="fixture-mini"><div className="mini-date"><strong>{date.toLocaleDateString('en-BM', { day: '2-digit' })}</strong><span>{date.toLocaleDateString('en-BM', { month: 'short' }).toUpperCase()}</span></div><div><strong>{fixture.teamName}</strong><span>vs {fixture.opponentName}</span><small>{date.toLocaleTimeString('en-BM', { hour: 'numeric', minute: '2-digit' })} · {fixture.venueName}</small></div></div> }
function LiveGalleryGrid({ items }: { items: LiveMediaItem[] }) { return <div className="gallery-grid">{items.map((item, index) => <figure className={index === 0 ? 'gallery-feature' : ''} key={item.id}>{item.kind === 'photo' ? <img src={item.url} alt={item.altText} loading="lazy" /> : <iframe src={item.url} title={item.altText || item.caption} loading="lazy" allowFullScreen />}<figcaption><span>{item.capturedOn ? new Date(item.capturedOn).toLocaleDateString('en-BM') : 'Warwick Bears'}</span><strong>{item.caption}</strong></figcaption></figure>)}</div> }
function SectionHeading({ eyebrow, title, description, link, linkText }: { eyebrow: string; title: string; description: string; link?: string; linkText?: string }) { return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{link && <Link className="text-link" to={link}>{linkText} <ArrowRight size={16} /></Link>}</div> }
function PageFrame({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) { return <><section className="page-intro"><div className="page-width"><p className="eyebrow gold">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></div></section><section className="section page-width">{children}</section></> }
function FilterBar({ children }: { children: ReactNode }) { return <div className="filter-bar">{children}</div> }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Search /><p>{text}</p></div> }
function LoadingState({ text }: { text: string }) { return <div className="empty-state" aria-live="polite"><Clock3 /><p>{text}</p></div> }
function ErrorState({ text }: { text: string }) { return <div className="empty-state error-state" role="alert"><X /><p>{text}</p></div> }
function ReminderSignup({ fixtures: liveFixtures }: { fixtures: LiveFixture[] }) { const [email, setEmail] = useState(''); const [teamId, setTeamId] = useState(''); const [message, setMessage] = useState(() => { const status = new URLSearchParams(window.location.search).get('reminder'); return status === 'confirmed' ? 'Your fixture reminders are confirmed.' : status === 'unsubscribed' ? 'You have been unsubscribed from fixture reminders.' : '' }); const [working, setWorking] = useState(false); const teams = [...new Map(liveFixtures.map((fixture) => [fixture.teamId, fixture.teamName])).entries()]; async function submit(event: FormEvent) { event.preventDefault(); setWorking(true); setMessage(''); try { const response = await fetch('/.netlify/functions/reminder-subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, teamId: teamId || null, reminderHours: 24 }) }); const result = await response.json() as { error?: string; message?: string }; if (!response.ok) throw new Error(result.error); setMessage(result.message ?? 'Check your email to confirm.'); setEmail('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Subscription failed.') } finally { setWorking(false) } } return <section className="reminder-signup"><div><p className="eyebrow">Fixture reminders</p><h2>Never miss the next match.</h2><p>Get an email 24 hours before fixtures for one team or the whole programme.</p></div><form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Team<select value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">All Warwick teams</option>{teams.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label><button className="button button-primary" disabled={working}>{working ? 'Subscribing…' : 'Email me reminders'}</button>{message && <p role="status">{message}</p>}</form></section> }
function formatShortDate(value: string) { return new Date(value).toLocaleDateString('en-BM', { month: 'short', day: '2-digit' }).toUpperCase() }
function outcomeLetter(fixture: LiveFixture) { return fixture.result?.outcome === 'win' ? 'W' : fixture.result?.outcome === 'loss' ? 'L' : fixture.result?.outcome === 'draw' ? 'D' : 'NC' }
function NotFound() { return <PageFrame eyebrow="404" title="That page is out of bounds" intro="The page you requested could not be found."><Link className="button button-dark" to="/">Return home</Link></PageFrame> }
function Footer() { return <footer><div className="page-width footer-grid"><div className="footer-brand"><Mark /><div><strong>Warwick Bears</strong><span>Warwick Academy Athletics</span></div></div><div><strong>Explore</strong>{navItems.slice(0, 4).map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</div><div><strong>Warwick Academy</strong><a href="https://warwick.bm">School website</a><Link to="/admin">Staff sign in</Link></div><div><strong>Stay in the game</strong><p>Follow fixtures and results across every Warwick Bears team.</p><Link className="text-link gold" to="/calendar">Open calendar <ArrowRight size={15} /></Link></div></div><div className="footer-base page-width"><span>© 2026 Warwick Academy</span><span>Warwick, Bermuda</span></div></footer> }

export default function App() { return <BrowserRouter><Shell /></BrowserRouter> }
