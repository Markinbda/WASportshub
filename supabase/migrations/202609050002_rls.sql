create or replace function public.current_staff_role()
returns public.staff_role
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  result public.staff_role;
begin
  select role into result
  from public.staff_profiles
  where user_id = auth.uid() and is_active;
  return result;
end;
$$;

create or replace function public.is_editor()
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  return coalesce(public.current_staff_role() in ('editor', 'admin'), false);
end;
$$;

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  return coalesce(public.current_staff_role() = 'admin', false);
end;
$$;

create or replace function public.can_manage_sport(target_sport_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  allowed boolean;
begin
  if public.is_editor() then
    return true;
  end if;

  select exists (
    select 1
    from public.staff_scopes scope
    left join public.teams team on team.id = scope.team_id
    where scope.staff_user_id = auth.uid()
      and (scope.sport_id = target_sport_id or team.sport_id = target_sport_id)
  ) into allowed;
  return allowed;
end;
$$;

create or replace function public.can_manage_team(target_team_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  allowed boolean;
begin
  if public.is_editor() then
    return true;
  end if;

  select exists (
    select 1
    from public.teams team
    join public.staff_scopes scope
      on scope.staff_user_id = auth.uid()
      and (scope.team_id = team.id or scope.sport_id = team.sport_id)
    where team.id = target_team_id
  ) into allowed;
  return allowed;
end;
$$;

create or replace function public.can_manage_student(target_student_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  allowed boolean;
begin
  if public.is_editor() then
    return true;
  end if;

  select exists (
    select 1
    from public.roster_memberships roster
    where roster.student_id = target_student_id
      and public.can_manage_team(roster.team_id)
  ) into allowed;
  return allowed;
end;
$$;

create or replace function public.is_public_media(target_media_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  allowed boolean;
begin
  select exists (
    select 1 from public.media_items
    where id = target_media_id
      and approval_status = 'approved'
      and visibility = 'public'
      and consent_confirmed
  ) into allowed;
  return allowed;
end;
$$;

create or replace function public.can_manage_media(target_media_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  allowed boolean;
begin
  if public.is_editor() then
    return true;
  end if;

  select exists (
    select 1
    from public.media_items media
    where media.id = target_media_id
      and media.uploaded_by = auth.uid()
  ) or exists (
    select 1 from public.media_teams mt
    where mt.media_id = target_media_id and public.can_manage_team(mt.team_id)
  ) or exists (
    select 1 from public.media_sports ms
    where ms.media_id = target_media_id and public.can_manage_sport(ms.sport_id)
  ) into allowed;
  return allowed;
end;
$$;

create or replace function public.can_read_media_path(target_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  allowed boolean;
begin
  select exists (
    select 1
    from public.media_items media
    where media.storage_path = target_path
      and (
        (media.approval_status = 'approved' and media.visibility = 'public' and media.consent_confirmed)
        or public.can_manage_media(media.id)
      )
  ) into allowed;
  return allowed;
end;
$$;

create or replace function public.get_public_roster(target_team_id uuid)
returns table (
  membership_id uuid,
  team_id uuid,
  display_name text,
  player_role text,
  jersey_number text,
  is_captain boolean
)
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  return query
  select
    roster.id,
    roster.team_id,
    case
      when team.roster_name_mode = 'full_name'
        then student.first_name || ' ' || student.last_name
      else student.first_name || ' ' || left(student.last_name, 1) || '.'
    end,
    roster.position,
    roster.jersey_number,
    roster.is_captain
  from public.roster_memberships roster
  join public.students student on student.id = roster.student_id
  join public.teams team on team.id = roster.team_id
  where roster.team_id = target_team_id
    and team.is_active
    and student.is_active
    and (roster.active_until is null or roster.active_until >= current_date)
  order by student.first_name, student.last_name;
end;
$$;

create or replace function public.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  old_data jsonb;
  new_data jsonb;
  target_id text;
begin
  if tg_op = 'INSERT' then
    new_data := to_jsonb(new);
    target_id := new_data ->> 'id';
  elsif tg_op = 'UPDATE' then
    old_data := to_jsonb(old);
    new_data := to_jsonb(new);
    target_id := coalesce(new_data ->> 'id', old_data ->> 'id');
  else
    old_data := to_jsonb(old);
    target_id := old_data ->> 'id';
  end if;

  insert into public.audit_events (
    actor_id, entity_table, entity_id, action, before_data, after_data
  ) values (
    auth.uid(), tg_table_name, target_id, tg_op, old_data, new_data
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_media_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if public.is_editor() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.approval_status <> 'pending'
      or new.visibility <> 'internal'
      or new.approved_by is not null
      or new.approved_at is not null
      or new.rejection_reason is not null
    then
      raise exception 'coach media must enter the approval queue as internal';
    end if;
  elsif new.approval_status is distinct from old.approval_status
    or new.visibility is distinct from old.visibility
    or new.approved_by is distinct from old.approved_by
    or new.approved_at is distinct from old.approved_at
    or new.rejection_reason is distinct from old.rejection_reason
  then
    raise exception 'only an editor or admin may moderate media';
  end if;

  return new;
end;
$$;

create trigger trg_media_items_moderation
  before insert or update on public.media_items
  for each row execute function public.enforce_media_moderation();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'staff_profiles', 'staff_scopes', 'sports', 'venues', 'seasons', 'teams',
    'students', 'roster_memberships', 'fixtures', 'match_results',
    'team_standings', 'tournament_placements', 'record_types',
    'individual_results', 'gallery_events', 'media_items', 'media_sports',
    'media_teams', 'media_events', 'news_posts', 'homepage_highlights',
    'reminder_subscribers', 'reminder_subscriptions', 'reminder_deliveries',
    'archive_seasons', 'archive_roster_entries', 'hall_of_fame_profiles',
    'hall_of_fame_sports', 'site_settings', 'invitations', 'audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy "staff read own profile" on public.staff_profiles for select
  using (user_id = auth.uid() or public.is_editor());
create policy "admins manage staff profiles" on public.staff_profiles for all
  using (public.is_admin()) with check (public.is_admin());

create policy "staff read own scopes" on public.staff_scopes for select
  using (staff_user_id = auth.uid() or public.is_editor());
create policy "admins manage staff scopes" on public.staff_scopes for all
  using (public.is_admin()) with check (public.is_admin());

create policy "public read sports" on public.sports for select using (is_active or public.is_editor());
create policy "editors manage sports" on public.sports for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read venues" on public.venues for select using (is_active or public.is_editor());
create policy "editors manage venues" on public.venues for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read sport venues" on public.sport_venues for select using (true);
create policy "editors manage sport venues" on public.sport_venues for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read seasons" on public.seasons for select using (true);
create policy "editors manage seasons" on public.seasons for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read teams" on public.teams for select using (is_active or public.is_editor());
create policy "editors manage teams" on public.teams for all
  using (public.is_editor()) with check (public.is_editor());

create policy "scoped staff read students" on public.students for select
  using (public.can_manage_student(id));
create policy "scoped staff insert students" on public.students for insert
  with check (public.current_staff_role() is not null);
create policy "scoped staff update students" on public.students for update
  using (public.can_manage_student(id)) with check (public.can_manage_student(id));
create policy "editors delete students" on public.students for delete using (public.is_editor());

create policy "scoped staff read rosters" on public.roster_memberships for select
  using (public.can_manage_team(team_id));
create policy "scoped staff insert rosters" on public.roster_memberships for insert
  with check (public.can_manage_team(team_id));
create policy "scoped staff update rosters" on public.roster_memberships for update
  using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));
create policy "scoped staff delete rosters" on public.roster_memberships for delete
  using (public.can_manage_team(team_id));

create policy "public read fixtures" on public.fixtures for select
  using (status <> 'draft' or public.can_manage_team(team_id));
create policy "scoped staff insert fixtures" on public.fixtures for insert
  with check (public.can_manage_team(team_id));
create policy "scoped staff update fixtures" on public.fixtures for update
  using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));
create policy "scoped staff delete fixtures" on public.fixtures for delete
  using (public.can_manage_team(team_id));

create policy "public read match results" on public.match_results for select
  using (exists (select 1 from public.fixtures fixture where fixture.id = fixture_id and fixture.status = 'completed'));
create policy "scoped staff manage match results" on public.match_results for all
  using (exists (select 1 from public.fixtures fixture where fixture.id = fixture_id and public.can_manage_team(fixture.team_id)))
  with check (exists (select 1 from public.fixtures fixture where fixture.id = fixture_id and public.can_manage_team(fixture.team_id)));

create policy "public read standings" on public.team_standings for select using (true);
create policy "scoped staff manage standings" on public.team_standings for all
  using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));

create policy "public read placements" on public.tournament_placements for select using (true);
create policy "scoped staff manage placements" on public.tournament_placements for all
  using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));

create policy "public read record types" on public.record_types for select using (true);
create policy "editors manage record types" on public.record_types for all
  using (public.is_editor()) with check (public.is_editor());

create policy "staff read individual results" on public.individual_results for select
  using (public.can_manage_team(team_id));
create policy "scoped staff manage individual results" on public.individual_results for all
  using (public.can_manage_team(team_id)) with check (public.can_manage_team(team_id));

create policy "public read gallery events" on public.gallery_events for select using (true);
create policy "editors manage gallery events" on public.gallery_events for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read approved media" on public.media_items for select
  using (public.is_public_media(id) or public.can_manage_media(id));
create policy "staff submit media" on public.media_items for insert
  with check (uploaded_by = auth.uid() and public.current_staff_role() is not null);
create policy "staff update managed media" on public.media_items for update
  using (public.can_manage_media(id)) with check (public.can_manage_media(id));
create policy "staff delete managed media" on public.media_items for delete
  using (public.can_manage_media(id));

create policy "public read media sports" on public.media_sports for select
  using (public.is_public_media(media_id) or public.can_manage_media(media_id));
create policy "staff manage media sports" on public.media_sports for all
  using (public.can_manage_media(media_id))
  with check (public.can_manage_media(media_id) and public.can_manage_sport(sport_id));

create policy "public read media teams" on public.media_teams for select
  using (public.is_public_media(media_id) or public.can_manage_media(media_id));
create policy "staff manage media teams" on public.media_teams for all
  using (public.can_manage_media(media_id))
  with check (public.can_manage_media(media_id) and public.can_manage_team(team_id));

create policy "public read media events" on public.media_events for select
  using (public.is_public_media(media_id) or public.can_manage_media(media_id));
create policy "staff manage media events" on public.media_events for all
  using (public.can_manage_media(media_id)) with check (public.can_manage_media(media_id));

create policy "public read news" on public.news_posts for select
  using (status = 'published' or public.is_editor());
create policy "editors manage news" on public.news_posts for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read highlights" on public.homepage_highlights for select
  using (status = 'published' or public.is_editor());
create policy "editors manage highlights" on public.homepage_highlights for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read archive" on public.archive_seasons for select
  using (status = 'published' or public.is_editor());
create policy "editors manage archive" on public.archive_seasons for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read archive rosters" on public.archive_roster_entries for select
  using (exists (select 1 from public.archive_seasons archive where archive.id = archive_season_id and archive.status = 'published'));
create policy "editors manage archive rosters" on public.archive_roster_entries for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read hall of fame" on public.hall_of_fame_profiles for select
  using (status = 'published' or public.is_editor());
create policy "editors manage hall of fame" on public.hall_of_fame_profiles for all
  using (public.is_editor()) with check (public.is_editor());

create policy "public read hall of fame sports" on public.hall_of_fame_sports for select using (true);
create policy "editors manage hall of fame sports" on public.hall_of_fame_sports for all
  using (public.is_editor()) with check (public.is_editor());

create policy "staff read public settings" on public.site_settings for select
  using (key in ('default_roster_name_mode', 'default_reminder_hours') or public.current_staff_role() is not null);
create policy "admins manage settings" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage invitations" on public.invitations for all
  using (public.is_admin()) with check (public.is_admin());

create policy "editors read audit events" on public.audit_events for select using (public.is_editor());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'staff_profiles', 'staff_scopes', 'sports', 'venues', 'sport_venues',
    'seasons', 'teams', 'students', 'roster_memberships', 'fixtures',
    'match_results', 'team_standings', 'tournament_placements', 'record_types',
    'individual_results', 'gallery_events', 'media_items', 'media_sports',
    'media_teams', 'media_events', 'news_posts', 'homepage_highlights',
    'archive_seasons', 'archive_roster_entries', 'hall_of_fame_profiles',
    'hall_of_fame_sports', 'site_settings'
  ] loop
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end;
$$;

grant select, insert, update, delete on public.invitations to authenticated;
grant select on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to authenticated;
grant execute on function public.get_public_roster(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'athletics-media',
  'athletics-media',
  false,
  25 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "read permitted athletics media" on storage.objects for select
  using (bucket_id = 'athletics-media' and public.can_read_media_path(name));

create policy "staff upload athletics media" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'athletics-media'
    and owner_id = auth.uid()::text
    and public.can_manage_team(nullif(split_part(name, '/', 1), '')::uuid)
  );

create policy "staff update athletics media" on storage.objects for update to authenticated
  using (bucket_id = 'athletics-media' and public.can_read_media_path(name))
  with check (bucket_id = 'athletics-media' and public.can_read_media_path(name));

create policy "staff delete athletics media" on storage.objects for delete to authenticated
  using (bucket_id = 'athletics-media' and public.can_read_media_path(name));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'staff_profiles', 'staff_scopes', 'sports', 'venues', 'seasons', 'teams',
    'students', 'roster_memberships', 'fixtures', 'match_results',
    'team_standings', 'tournament_placements', 'record_types',
    'individual_results', 'media_items', 'news_posts', 'homepage_highlights',
    'archive_seasons', 'archive_roster_entries', 'hall_of_fame_profiles',
    'site_settings', 'invitations'
  ] loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.capture_audit_event()',
      'trg_' || table_name || '_audit',
      table_name
    );
  end loop;
end;
$$;

revoke all on public.reminder_subscribers from anon, authenticated;
revoke all on public.reminder_subscriptions from anon, authenticated;
revoke all on public.reminder_deliveries from anon, authenticated;
revoke all on public.audit_events from anon;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

notify pgrst, 'reload schema';