import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ArrowRight, CalendarDays, ChevronDown, Clock3, LockKeyhole, MapPin, Menu, Search, ShieldCheck, Trophy, Users, X } from 'lucide-react'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { fixtures, gallery, news, roster, sports } from './lib/data'
import { supabase } from './lib/supabase'
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
      <Route path="/gallery" element={<GalleryPage />} /><Route path="/history" element={<HistoryPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<NotFound />} />
    </Routes></main><Footer />
  </div>
}

function HomePage() {
  return <>
    <section className="hero-banner">
      <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=2000&q=90" alt="Football players competing on a floodlit field" />
      <div className="hero-overlay" /><div className="hero-content page-width"><p className="eyebrow light">Warwick Academy Athletics</p><h1>Warwick Bears</h1><p className="hero-lead">Every team. Every result. One proud school community.</p><div className="hero-actions"><Link className="button button-primary" to="/sports">Explore our sports <ArrowRight size={17} /></Link><Link className="button button-ghost" to="/calendar">View the calendar</Link></div></div>
      <div className="hero-caption page-width"><span>Season spotlight</span> High-Performance Football begins its autumn programme</div>
    </section>
    <section className="week-strip"><div className="page-width week-inner"><div className="section-label"><CalendarDays size={20} /><span><strong>This week</strong><small>Upcoming fixtures</small></span></div><div className="fixture-scroll">{fixtures.slice(0, 3).map((fixture) => <FixtureMini key={fixture.team} fixture={fixture} />)}</div><Link className="text-link" to="/calendar">Full calendar <ArrowRight size={16} /></Link></div></section>
    <section className="section page-width"><SectionHeading eyebrow="Find your team" title="Built for every Bear" description="From first fixtures to high-performance programmes, Warwick athletes have room to grow." link="/sports" linkText="All sports" /><div className="sport-grid featured-sports">{sports.filter((sport) => sport.category === 'primary').slice(0, 6).map((sport) => <SportCard key={sport.slug} sport={sport} />)}</div></section>
    <section className="section section-ink"><div className="page-width performance-grid"><div><p className="eyebrow gold">Performance snapshot</p><h2>A season already taking shape.</h2><p>Results, records and milestones from across Warwick Academy sport.</p><Link className="button button-outline" to="/results">Explore results <ArrowRight size={17} /></Link></div><div className="stat-grid"><div><strong>18</strong><span>School swim records</span></div><div><strong>14</strong><span>Track podium finishes</span></div><div><strong>82%</strong><span>Team win rate this week</span></div><div><strong>24</strong><span>Active teams</span></div></div></div></section>
    <section className="section page-width"><SectionHeading eyebrow="From the sidelines" title="Latest galleries" description="Training, competition and the moments that bring our community together." link="/gallery" linkText="View gallery" /><GalleryGrid limit={4} /></section>
    <section className="section news-section"><div className="page-width"><SectionHeading eyebrow="Bear news" title="Around the programme" description="Stories and updates from Warwick Academy athletics." /><div className="news-grid">{news.map((item) => <article className="news-item" key={item.title}><p className="meta">{item.sport} · {item.date}</p><h3>{item.title}</h3><p>{item.summary}</p><span className="read-more">Read story <ArrowRight size={15} /></span></article>)}</div></div></section>
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
  if (!sport) return <NotFound />
  const sportFixtures = fixtures.filter((item) => item.sport === sport.name)
  return <><section className="sport-hero" style={{ '--sport-accent': sport.accent } as React.CSSProperties}><div className="page-width sport-hero-inner"><div className="sport-symbol">{sport.icon}</div><div><p className="eyebrow light">Warwick Bears sport</p><h1>{sport.name}</h1><p>{sport.description}</p></div>{sport.record && <div className="record-pill"><small>Current record</small><strong>{sport.record}</strong></div>}</div></section><div className="section page-width two-column"><div><p className="eyebrow">Current season</p><h2>Teams</h2><div className="team-list">{(sport.teams ?? ['Activity group']).map((team) => <Link to="/teams" key={team}><span><Users size={18} /> {team}</span><ArrowRight size={17} /></Link>)}</div></div><div><p className="eyebrow">Coming up</p><h2>Next fixtures</h2><div className="fixture-list">{sportFixtures.length ? sportFixtures.map((fixture) => <FixtureMini key={fixture.team} fixture={fixture} />) : <EmptyState text="Fixtures will appear here when the schedule is published." />}</div></div></div></>
}

function TeamsPage() {
  const [team, setTeam] = useState('U15 Football')
  return <PageFrame eyebrow="Meet the Bears" title="Team rosters" intro="Browse current squads by sport, age group and season."><FilterBar><label>Team<select value={team} onChange={(event) => setTeam(event.target.value)}><option>U15 Football</option><option>Varsity Netball</option><option>Competitive Swim</option></select></label><label>Season<select><option>2026–27</option></select></label></FilterBar><div className="team-heading"><div><p className="eyebrow">2026–27 squad</p><h2>{team}</h2><p>Coach Jordan Smith · Lower Field</p></div><div className="coach-badge"><span>JS</span><small>Head coach</small><strong>Jordan Smith</strong></div></div><div className="roster-grid">{roster.map((player) => <div className="roster-card" key={player.name}><span className="jersey">{player.number}</span><div><strong>{player.name}</strong><small>{player.role}</small></div></div>)}</div><p className="privacy-note"><ShieldCheck size={17} /> Student names are displayed according to the team’s approved privacy setting.</p></PageFrame>
}

function ResultsPage() {
  const rows = [['SEP 03', 'Varsity Basketball', 'CedarBridge Academy', '68', '54', 'W'], ['SEP 02', 'U15 Football', 'Saltus Grammar School', '3', '1', 'W'], ['AUG 30', 'Varsity Netball', 'BHS', '29', '31', 'L'], ['AUG 28', 'U13 Cricket', 'Somersfield Academy', '142/6', '138/8', 'W']]
  return <PageFrame eyebrow="Records & results" title="The season in numbers" intro="Latest scores, team standings and high-performance milestones."><div className="result-summary"><div><Trophy /><strong>12–3</strong><span>Basketball</span></div><div><Trophy /><strong>10–2–2</strong><span>Football</span></div><div><Trophy /><strong>18</strong><span>Swim records</span></div><div><Trophy /><strong>14</strong><span>Track podiums</span></div></div><h2 className="subheading">Recent results</h2><div className="results-table" role="table" aria-label="Recent results">{rows.map((row) => <div className="result-row" role="row" key={row[0] + row[1]}><span className="result-date">{row[0]}</span><strong>{row[1]}</strong><span>vs {row[2]}</span><b>{row[3]} – {row[4]}</b><i className={`outcome outcome-${row[5].toLowerCase()}`}>{row[5]}</i></div>)}</div></PageFrame>
}

function CalendarPage() {
  const [sport, setSport] = useState('All sports')
  return <PageFrame eyebrow="Events calendar" title="What’s happening" intro="Fixtures, meets and competitions across every Warwick Bears team."><FilterBar><label>Sport<select value={sport} onChange={(event) => setSport(event.target.value)}><option>All sports</option>{sports.filter((item) => item.category === 'primary').map((item) => <option key={item.name}>{item.name}</option>)}</select></label><button className="button button-dark">Subscribe to calendar</button></FilterBar><div className="calendar-list">{fixtures.filter((item) => sport === 'All sports' || item.sport === sport).map((fixture) => <div className="calendar-item" key={fixture.team}><div className="date-block"><strong>{fixture.day}</strong><span>{fixture.month}</span></div><div className="calendar-copy"><span className="sport-tag">{fixture.sport}</span><h3>{fixture.team} <small>vs</small> {fixture.opponent}</h3><p><Clock3 size={15} /> {fixture.time} <MapPin size={15} /> {fixture.venue}</p></div><button className="icon-button" aria-label={`Add ${fixture.team} fixture to calendar`}><CalendarDays /></button></div>)}</div></PageFrame>
}

function GalleryPage() { return <PageFrame eyebrow="Photo & video" title="Bear moments" intro="A view from training grounds, courts, fields and competition days."><FilterBar><label>Sport<select><option>All sports</option>{sports.filter((item) => item.category === 'primary').map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>Season<select><option>2026–27</option></select></label></FilterBar><GalleryGrid /></PageFrame> }

function HistoryPage() { return <PageFrame eyebrow="History & archive" title="Built over generations" intro="Celebrating the teams, athletes and achievements that shaped Warwick Academy sport."><div className="archive-banner"><div><p className="eyebrow gold">Featured season</p><h2>2016–17: A year to remember</h2><p>Championship performances across swimming, football and track marked one of Warwick’s strongest all-round sporting seasons.</p></div><span className="archive-year">2017</span></div><div className="decade-grid">{['2020s', '2010s', '2000s', '1990s', 'Earlier'].map((decade) => <button key={decade}><span>{decade}</span><ArrowRight /></button>)}</div><div className="hall-heading"><p className="eyebrow">Hall of fame</p><h2>Outstanding Bears</h2></div><EmptyState text="Hall of Fame profiles are being prepared by the Athletics team." /></PageFrame> }

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [message, setMessage] = useState(''), [working, setWorking] = useState(false)
  const [staffAccess, setStaffAccess] = useState<boolean | null>(null)
  useEffect(() => { if (!supabase) return; let mounted = true; const timeout = window.setTimeout(() => { if (mounted) setMessage('Authentication is taking longer than expected.') }, 4000); void supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); clearTimeout(timeout) } }).catch(() => { if (mounted) setMessage('Unable to reach authentication.') }); const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setStaffAccess(null) }); return () => { mounted = false; clearTimeout(timeout); data.subscription.unsubscribe() } }, [])
  useEffect(() => {
    if (!supabase || !session?.user) return
    let active = true
    async function loadStaffAccess() {
      try {
        const { data, error } = await supabase!.from('staff_profiles').select('role, is_active').eq('user_id', session!.user.id).maybeSingle()
        if (error) console.error('[AdminPage]', error)
        if (active) setStaffAccess(Boolean(data?.is_active))
      } catch (error) {
        console.error('[AdminPage] threw', error)
        if (active) setStaffAccess(false)
      }
    }
    void loadStaffAccess()
    return () => { active = false }
  }, [session])
  async function signIn(event: FormEvent) { event.preventDefault(); if (!supabase) return setMessage('Supabase configuration is not available.'); setWorking(true); try { const { error } = await supabase.auth.signInWithPassword({ email, password }); setMessage(error?.message ?? '') } catch { setMessage('Sign in could not be completed.') } finally { setWorking(false) } }
  if (session && staffAccess === null) return <PageFrame eyebrow="Staff workspace" title="Checking access" intro="Confirming your Athletics Hub role."><div className="empty-state"><LockKeyhole /><p>Please wait…</p></div></PageFrame>
  if (session && !staffAccess) return <PageFrame eyebrow="Access restricted" title="Staff role required" intro="Your account is signed in but has not been assigned an Athletics Hub role."><button className="button button-dark" onClick={() => void supabase?.auth.signOut()}>Sign out</button></PageFrame>
  if (session && staffAccess) return <AdminDashboard email={session.user.email ?? 'Staff member'} onSignOut={() => void supabase?.auth.signOut()} />
  return <div className="auth-page"><div className="auth-panel"><Link className="brand" to="/"><Mark /><span className="brand-copy"><strong>Warwick Bears</strong><small>Athletics Hub</small></span></Link><div className="auth-copy"><p className="eyebrow gold">Staff access</p><h1>Manage the programme.</h1><p>For authorised coaches and Athletics staff. Public visitors do not need an account.</p></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={signIn}><LockKeyhole size={26} /><h2>Staff sign in</h2><p>Use your Warwick Academy account.</p><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{message && <p className="form-message" role="alert">{message}</p>}<button className="button button-primary full" disabled={working}>{working ? 'Signing in…' : 'Sign in'}</button><Link to="/">Return to public site</Link></form></div></div>
}

function AdminDashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) { const modules = [['Sports & teams', '24 active teams'], ['Roster manager', '6 recent updates'], ['Media manager', '0 pending approvals'], ['Records & results', '4 results this week'], ['Fixtures', '4 upcoming'], ['Archive', 'Start adding history']]; return <PageFrame eyebrow="Staff workspace" title="Athletics dashboard" intro={`Signed in as ${email}`}><div className="admin-actions"><button className="button button-dark" onClick={onSignOut}>Sign out</button></div><div className="admin-grid">{modules.map(([title, detail]) => <button key={title}><span>{title}</span><small>{detail}</small><ArrowRight /></button>)}</div></PageFrame> }
function SportCard({ sport, compact = false }: { sport: (typeof sports)[number]; compact?: boolean }) { return <Link className={compact ? 'sport-card compact' : 'sport-card'} to={`/sports/${sport.slug}`} style={{ '--sport-accent': sport.accent } as React.CSSProperties}>{!compact && <img className="sport-photo" src={`/sport-tiles/${sport.slug}.jpg`} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />}<span className="sport-icon">{sport.icon}</span><div><h3>{sport.name}</h3>{!compact && <p>{sport.description}</p>}</div><ArrowRight className="card-arrow" /></Link> }
function FixtureMini({ fixture }: { fixture: (typeof fixtures)[number] }) { return <div className="fixture-mini"><div className="mini-date"><strong>{fixture.day}</strong><span>{fixture.month}</span></div><div><strong>{fixture.team}</strong><span>vs {fixture.opponent}</span><small>{fixture.time} · {fixture.venue}</small></div></div> }
function GalleryGrid({ limit }: { limit?: number }) { return <div className="gallery-grid">{gallery.slice(0, limit).map((item, index) => <figure className={index === 0 ? 'gallery-feature' : ''} key={item.title}><img src={item.image} alt={item.title} loading="lazy" /><figcaption><span>{item.sport}</span><strong>{item.title}</strong></figcaption></figure>)}</div> }
function SectionHeading({ eyebrow, title, description, link, linkText }: { eyebrow: string; title: string; description: string; link?: string; linkText?: string }) { return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{link && <Link className="text-link" to={link}>{linkText} <ArrowRight size={16} /></Link>}</div> }
function PageFrame({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) { return <><section className="page-intro"><div className="page-width"><p className="eyebrow gold">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></div></section><section className="section page-width">{children}</section></> }
function FilterBar({ children }: { children: ReactNode }) { return <div className="filter-bar">{children}</div> }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Search /><p>{text}</p></div> }
function NotFound() { return <PageFrame eyebrow="404" title="That page is out of bounds" intro="The page you requested could not be found."><Link className="button button-dark" to="/">Return home</Link></PageFrame> }
function Footer() { return <footer><div className="page-width footer-grid"><div className="footer-brand"><Mark /><div><strong>Warwick Bears</strong><span>Warwick Academy Athletics</span></div></div><div><strong>Explore</strong>{navItems.slice(0, 4).map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</div><div><strong>Warwick Academy</strong><a href="https://warwick.bm">School website</a><Link to="/admin">Staff sign in</Link></div><div><strong>Stay in the game</strong><p>Follow fixtures and results across every Warwick Bears team.</p><Link className="text-link gold" to="/calendar">Open calendar <ArrowRight size={15} /></Link></div></div><div className="footer-base page-width"><span>© 2026 Warwick Academy</span><span>Warwick, Bermuda</span></div></footer> }

export default function App() { return <BrowserRouter><Shell /></BrowserRouter> }
