insert into public.studios (id, code, name, shoot_type)
values ('a1111111-1111-4111-8111-111111111111', 'STUDIO 04', 'Studio 04', 'REEL SHOOTS')
on conflict (code) do nothing;

with days as (
  select d::date as day
  from generate_series('2026-10-28'::date, '2026-10-31'::date, '1 day') as d
),
blocks as (
  select * from (values
    (time '09:00', time '10:30'),
    (time '11:00', time '12:30'),
    (time '13:00', time '14:30'),
    (time '15:00', time '16:30'),
    (time '17:00', time '18:30'),
    (time '19:00', time '20:30'),
    (time '21:00', time '22:30')
  ) as t(start_t, end_t)
)
insert into public.time_slots (studio_id, starts_at, ends_at, capacity, booked_count)
select
  'a1111111-1111-4111-8111-111111111111'::uuid,
  (days.day + blocks.start_t) at time zone 'America/New_York',
  (days.day + blocks.end_t) at time zone 'America/New_York',
  1,
  case
    when days.day = '2026-10-28' and blocks.start_t = time '09:00' then 1
    else 0
  end
from days cross join blocks
where not exists (
  select 1 from public.time_slots ts
  where ts.studio_id = 'a1111111-1111-4111-8111-111111111111'::uuid
);
