insert into public.sports (name, slug, description, category, sort_order) values
  ('Badminton', 'badminton', 'Competitive badminton teams across school age groups.', 'primary', 10),
  ('Basketball', 'basketball', 'Warwick Bears basketball teams and development programme.', 'primary', 20),
  ('Cricket', 'cricket', 'School cricket from junior development through senior competition.', 'primary', 30),
  ('Cross Country', 'cross-country', 'Distance running teams competing across Bermuda.', 'primary', 40),
  ('Football', 'football', 'Warwick Bears football teams across primary and secondary age groups.', 'primary', 50),
  ('Netball', 'netball', 'Competitive netball teams and player development.', 'primary', 60),
  ('Rugby', 'rugby', 'Warwick Bears rugby teams and fixtures.', 'primary', 70),
  ('Swimming', 'swimming', 'Competitive swimming in Warwick Academy’s 25-metre pool.', 'primary', 80),
  ('Track & Field', 'track-and-field', 'Track and field competition, training and personal bests.', 'primary', 90),
  ('Volleyball', 'volleyball', 'Indoor volleyball teams and competitions.', 'primary', 100),
  ('Archery', 'archery', 'Archery activity programme.', 'secondary', 110),
  ('Bowling', 'bowling', 'Bowling activity programme.', 'secondary', 120),
  ('Boxing', 'boxing', 'Boxing fitness and skills programme.', 'secondary', 130),
  ('Field Hockey', 'field-hockey', 'Field hockey activity programme.', 'secondary', 140),
  ('Indoor Football', 'indoor-football', 'Indoor football activity programme.', 'secondary', 150),
  ('Kayaking', 'kayaking', 'Kayaking activity programme.', 'secondary', 160),
  ('Mountain Biking', 'mountain-biking', 'Mountain biking activity programme.', 'secondary', 170),
  ('Pickleball', 'pickleball', 'Pickleball activity programme.', 'secondary', 180),
  ('Sailing', 'sailing', 'Sailing activity programme.', 'secondary', 190),
  ('Softball', 'softball', 'Softball activity programme.', 'secondary', 200),
  ('Squash', 'squash', 'Squash activity programme.', 'secondary', 210),
  ('Table Tennis', 'table-tennis', 'Table tennis activity programme.', 'secondary', 220),
  ('Tennis', 'tennis', 'Tennis activity programme.', 'secondary', 230),
  ('Walking', 'walking', 'Walking and wellbeing activity programme.', 'secondary', 240),
  ('Weights', 'weights', 'Supervised strength and conditioning activity.', 'secondary', 250),
  ('Yoga', 'yoga', 'Yoga and mobility activity programme.', 'secondary', 260),
  ('Equestrian', 'equestrian', 'Information for private equestrian sessions.', 'private_session', 270),
  ('Dance', 'dance', 'Information for private dance sessions.', 'private_session', 280),
  ('Fitness', 'fitness', 'Information for private fitness sessions.', 'private_session', 290)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  sort_order = excluded.sort_order;

insert into public.sports (
  parent_sport_id, name, slug, description, category, is_high_performance, sort_order
)
select id, 'High-Performance Football', 'high-performance-football',
  'Advanced football development for selected student athletes.', 'primary', true, 51
from public.sports where slug = 'football'
on conflict (slug) do update set
  parent_sport_id = excluded.parent_sport_id,
  description = excluded.description,
  is_high_performance = true;

insert into public.sports (
  parent_sport_id, name, slug, description, category, is_high_performance, sort_order
)
select id, 'High-Performance Swim', 'high-performance-swim',
  'Advanced swim training and structured performance records.', 'primary', true, 81
from public.sports where slug = 'swimming'
on conflict (slug) do update set
  parent_sport_id = excluded.parent_sport_id,
  description = excluded.description,
  is_high_performance = true;

insert into public.venues (name, description, capacity, features) values
  ('Nancy A. Smith Sports Hall', 'Indoor home for basketball, volleyball, badminton and indoor football.', 450, array['Indoor court', 'Spectator seating']),
  ('Outdoor Netball Court', 'Outdoor court for training and competitive netball.', null, array['Outdoor court']),
  ('Upper Field', 'Grass field used for cricket and football.', null, array['Grass field']),
  ('Lower Field', 'Multi-sport field for football, rugby, softball and track and field.', null, array['Mobile lighting', 'Grass field']),
  ('Cricket Nets', 'Dedicated cricket practice nets.', null, array['Practice nets']),
  ('25m / 6-lane Swimming Pool', 'Six-lane, 25-metre pool for training and competition.', null, array['25 metre pool', '6 lanes'])
on conflict (name) do update set
  description = excluded.description,
  capacity = excluded.capacity,
  features = excluded.features;

insert into public.sport_venues (sport_id, venue_id)
select sport.id, venue.id
from (values
  ('basketball', 'Nancy A. Smith Sports Hall'),
  ('volleyball', 'Nancy A. Smith Sports Hall'),
  ('badminton', 'Nancy A. Smith Sports Hall'),
  ('indoor-football', 'Nancy A. Smith Sports Hall'),
  ('netball', 'Outdoor Netball Court'),
  ('cricket', 'Upper Field'),
  ('football', 'Upper Field'),
  ('high-performance-football', 'Upper Field'),
  ('football', 'Lower Field'),
  ('high-performance-football', 'Lower Field'),
  ('rugby', 'Lower Field'),
  ('softball', 'Lower Field'),
  ('track-and-field', 'Lower Field'),
  ('cricket', 'Cricket Nets'),
  ('swimming', '25m / 6-lane Swimming Pool'),
  ('high-performance-swim', '25m / 6-lane Swimming Pool')
) as association(sport_slug, venue_name)
join public.sports sport on sport.slug = association.sport_slug
join public.venues venue on venue.name = association.venue_name
on conflict do nothing;

insert into public.seasons (name, school_year, start_date, end_date, is_current)
values ('2026–27 Athletics Season', '2026–27', '2026-09-01', '2027-08-31', true)
on conflict (name, school_year) do update set
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  is_current = excluded.is_current;

insert into public.site_settings (key, value, description) values
  ('default_roster_name_mode', '"first_and_initial"'::jsonb, 'Default public name format for newly created teams.'),
  ('default_reminder_hours', '24'::jsonb, 'Default fixture reminder lead time in hours.')
on conflict (key) do update set value = excluded.value, description = excluded.description;

notify pgrst, 'reload schema';