create extension if not exists "pgcrypto";

create type public.staff_role as enum ('coach', 'editor', 'admin');
create type public.sport_category as enum ('primary', 'secondary', 'private_session');
create type public.roster_name_mode as enum ('first_and_initial', 'full_name');
create type public.fixture_status as enum ('draft', 'scheduled', 'completed', 'postponed', 'cancelled');
create type public.home_away as enum ('home', 'away', 'neutral');
create type public.match_outcome as enum ('win', 'loss', 'draw', 'no_contest');
create type public.media_kind as enum ('photo', 'youtube', 'vimeo');
create type public.media_approval_status as enum ('pending', 'approved', 'rejected');
create type public.media_visibility as enum ('public', 'internal');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.delivery_status as enum ('pending', 'sent', 'failed', 'cancelled');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  photo_path text,
  role public.staff_role not null default 'coach',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sports (
  id uuid primary key default gen_random_uuid(),
  parent_sport_id uuid references public.sports(id) on delete set null,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  category public.sport_category not null,
  is_high_performance boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  capacity integer check (capacity is null or capacity >= 0),
  features text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sport_venues (
  sport_id uuid not null references public.sports(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  primary key (sport_id, venue_id)
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_year text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, school_year),
  check (end_date >= start_date)
);

create unique index seasons_one_current_idx on public.seasons (is_current) where is_current;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete restrict,
  season_id uuid not null references public.seasons(id) on delete restrict,
  home_venue_id uuid references public.venues(id) on delete set null,
  name text not null,
  slug text not null,
  age_group text not null,
  description text not null default '',
  roster_name_mode public.roster_name_mode not null default 'first_and_initial',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, slug)
);

create table public.staff_scopes (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references public.staff_profiles(user_id) on delete cascade,
  sport_id uuid references public.sports(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((sport_id is not null)::integer + (team_id is not null)::integer = 1)
);

create unique index staff_scopes_sport_idx on public.staff_scopes (staff_user_id, sport_id) where sport_id is not null;
create unique index staff_scopes_team_idx on public.staff_scopes (staff_user_id, team_id) where team_id is not null;

create table public.students (
  id uuid primary key default gen_random_uuid(),
  external_reference text unique,
  first_name text not null,
  last_name text not null,
  graduation_year integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roster_memberships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  team_id uuid not null references public.teams(id) on delete cascade,
  position text,
  jersey_number text,
  is_captain boolean not null default false,
  active_from date,
  active_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, team_id),
  check (active_until is null or active_from is null or active_until >= active_from)
);

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  opponent_team_id uuid references public.teams(id) on delete set null,
  opponent_name text not null,
  venue_id uuid references public.venues(id) on delete set null,
  external_venue text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  home_away public.home_away not null default 'home',
  status public.fixture_status not null default 'draft',
  notes text,
  reminder_hours integer not null default 24 check (reminder_hours between 1 and 168),
  reminders_enabled boolean not null default true,
  created_by uuid references public.staff_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index fixtures_team_starts_idx on public.fixtures (team_id, starts_at);
create index fixtures_status_starts_idx on public.fixtures (status, starts_at);

create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null unique references public.fixtures(id) on delete cascade,
  team_score numeric,
  opponent_score numeric,
  outcome public.match_outcome not null,
  summary text,
  recorded_by uuid references public.staff_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_standings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  competition_name text not null,
  played integer not null default 0 check (played >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  points numeric not null default 0,
  rank integer check (rank is null or rank > 0),
  updated_at timestamptz not null default now(),
  unique (team_id, competition_name)
);

create table public.tournament_placements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  tournament_name text not null,
  placement text not null,
  event_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.record_types (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete cascade,
  name text not null,
  unit text not null,
  lower_is_better boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sport_id, name)
);

create table public.individual_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  team_id uuid not null references public.teams(id) on delete cascade,
  record_type_id uuid not null references public.record_types(id) on delete restrict,
  result_value numeric not null,
  display_value text not null,
  event_date date not null,
  venue_id uuid references public.venues(id) on delete set null,
  is_verified boolean not null default false,
  recorded_by uuid references public.staff_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index individual_results_lookup_idx on public.individual_results (record_type_id, result_value);

create table public.gallery_events (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete restrict,
  fixture_id uuid references public.fixtures(id) on delete set null,
  name text not null,
  event_date date not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  kind public.media_kind not null,
  storage_path text,
  external_url text,
  thumbnail_path text,
  caption text not null default '',
  alt_text text not null default '',
  captured_on date,
  approval_status public.media_approval_status not null default 'pending',
  visibility public.media_visibility not null default 'internal',
  consent_confirmed boolean not null default false,
  uploaded_by uuid references public.staff_profiles(user_id) on delete set null,
  approved_by uuid references public.staff_profiles(user_id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'photo' and storage_path is not null and external_url is null)
    or (kind in ('youtube', 'vimeo') and external_url is not null and storage_path is null)
  ),
  check (visibility = 'internal' or consent_confirmed)
);

create table public.media_sports (
  media_id uuid not null references public.media_items(id) on delete cascade,
  sport_id uuid not null references public.sports(id) on delete cascade,
  primary key (media_id, sport_id)
);

create table public.media_teams (
  media_id uuid not null references public.media_items(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (media_id, team_id)
);

create table public.media_events (
  media_id uuid not null references public.media_items(id) on delete cascade,
  event_id uuid not null references public.gallery_events(id) on delete cascade,
  primary key (media_id, event_id)
);

create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid references public.sports(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null,
  body text not null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references public.staff_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.homepage_highlights (
  id uuid primary key default gen_random_uuid(),
  media_id uuid references public.media_items(id) on delete set null,
  title text not null,
  summary text not null,
  link_url text,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.publish_status not null default 'draft',
  created_by uuid references public.staff_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table public.reminder_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_verified boolean not null default false,
  verification_token_hash text,
  unsubscribe_token_hash text not null unique,
  default_reminder_hours integer not null default 24 check (default_reminder_hours between 1 and 168),
  consented_at timestamptz not null default now(),
  verified_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminder_subscriptions (
  subscriber_id uuid not null references public.reminder_subscribers(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index reminder_subscription_team_idx on public.reminder_subscriptions (subscriber_id, team_id) where team_id is not null;
create unique index reminder_subscription_all_idx on public.reminder_subscriptions (subscriber_id) where team_id is null;

create table public.reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  subscriber_id uuid not null references public.reminder_subscribers(id) on delete cascade,
  scheduled_for timestamptz not null,
  status public.delivery_status not null default 'pending',
  sendgrid_message_id text,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fixture_id, subscriber_id)
);

create index reminder_deliveries_pending_idx on public.reminder_deliveries (scheduled_for) where status = 'pending';

create table public.archive_seasons (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete restrict,
  school_year text not null,
  team_name text not null,
  age_group text,
  write_up text not null default '',
  notable_results text not null default '',
  team_photo_path text,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sport_id, school_year, team_name)
);

create table public.archive_roster_entries (
  id uuid primary key default gen_random_uuid(),
  archive_season_id uuid not null references public.archive_seasons(id) on delete cascade,
  display_name text not null,
  attendance_years text,
  role text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.hall_of_fame_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  years_attended text,
  biography text not null default '',
  notable_achievement text not null,
  photo_path text,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hall_of_fame_sports (
  profile_id uuid not null references public.hall_of_fame_profiles(id) on delete cascade,
  sport_id uuid not null references public.sports(id) on delete cascade,
  primary key (profile_id, sport_id)
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.staff_profiles(user_id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.staff_role not null,
  token_hash text not null unique,
  status public.invitation_status not null default 'pending',
  invited_by uuid references public.staff_profiles(user_id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  entity_table text not null,
  entity_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_entity_idx on public.audit_events (entity_table, entity_id, created_at desc);
create index audit_events_actor_idx on public.audit_events (actor_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'staff_profiles', 'sports', 'venues', 'seasons', 'teams', 'students',
    'roster_memberships', 'fixtures', 'match_results', 'team_standings',
    'tournament_placements', 'individual_results', 'gallery_events',
    'media_items', 'news_posts', 'homepage_highlights', 'reminder_subscribers',
    'reminder_deliveries', 'archive_seasons', 'hall_of_fame_profiles'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'trg_' || table_name || '_updated_at',
      table_name
    );
  end loop;
end;
$$;