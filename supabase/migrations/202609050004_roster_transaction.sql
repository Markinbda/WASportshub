create or replace function public.add_roster_member(
  target_team_id uuid,
  first_name text,
  last_name text,
  graduation_year integer default null,
  jersey_number text default null,
  player_role text default null,
  is_captain boolean default false
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  new_student_id uuid;
begin
  if not public.can_manage_team(target_team_id) then
    raise exception 'not authorized to manage this team';
  end if;

  insert into public.students (first_name, last_name, graduation_year)
  values (trim(first_name), trim(last_name), graduation_year)
  returning id into new_student_id;

  insert into public.roster_memberships (
    student_id, team_id, position, jersey_number, is_captain
  ) values (
    new_student_id, target_team_id, nullif(trim(player_role), ''),
    nullif(trim(jersey_number), ''), is_captain
  );

  return new_student_id;
end;
$$;

revoke all on function public.add_roster_member(uuid, text, text, integer, text, text, boolean) from public;
grant execute on function public.add_roster_member(uuid, text, text, integer, text, text, boolean) to authenticated;

notify pgrst, 'reload schema';