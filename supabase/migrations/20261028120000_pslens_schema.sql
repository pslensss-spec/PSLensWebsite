-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  initial text not null default 'R',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name_val text;
  initial_val text;
begin
  name_val := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Guest');
  initial_val := upper(left(name_val, 1));
  insert into public.profiles (id, display_name, initial)
  values (new.id, name_val, initial_val);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.studios (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  shoot_type text not null,
  created_at timestamptz not null default now()
);

alter table public.studios enable row level security;

create policy "Studios are publicly readable"
  on public.studios for select
  using (true);

create type public.slot_status as enum ('open', 'few_left', 'full');

create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null default 1 check (capacity > 0),
  booked_count int not null default 0 check (booked_count >= 0),
  status public.slot_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint time_slots_range check (ends_at > starts_at),
  constraint time_slots_capacity check (booked_count <= capacity)
);

create index time_slots_studio_starts_idx on public.time_slots (studio_id, starts_at);

alter table public.time_slots enable row level security;

create policy "Time slots are publicly readable"
  on public.time_slots for select
  using (true);

create or replace function public.refresh_slot_status()
returns trigger
language plpgsql
as $$
begin
  if new.booked_count >= new.capacity then
    new.status := 'full';
  elsif new.booked_count > 0 and new.booked_count::numeric / new.capacity::numeric >= 0.6 then
    new.status := 'few_left';
  else
    new.status := 'open';
  end if;
  return new;
end;
$$;

create trigger time_slots_status_trg
  before insert or update of booked_count, capacity on public.time_slots
  for each row execute function public.refresh_slot_status();

create type public.booking_status as enum ('confirmed', 'cancelled');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_id uuid not null references public.time_slots (id) on delete restrict,
  status public.booking_status not null default 'confirmed',
  studio_name text not null,
  studio_code text not null,
  shoot_type text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  guest_email text,
  guest_name text,
  ip text,
  city text,
  region text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_user_idx on public.bookings (user_id, created_at desc);
create index bookings_slot_idx on public.bookings (slot_id);

create unique index bookings_active_unique
  on public.bookings (user_id, slot_id)
  where status = 'confirmed';

alter table public.bookings enable row level security;

create policy "Users read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  ip text,
  city text,
  region text,
  country text,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Users read own contact messages"
  on public.contact_messages for select
  using (auth.uid() = user_id);
