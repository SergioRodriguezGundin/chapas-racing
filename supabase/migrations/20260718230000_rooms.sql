-- F03-B: public.rooms + room_members + RLS + create_room/join_room
-- Ref: progress/research_f03_realtime_sync.md §4

create type public.room_status as enum ('lobby', 'playing', 'finished');

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  track_id text not null,
  host_id uuid not null references public.profiles (id) on delete cascade,
  max_players integer not null,
  status public.room_status not null default 'lobby',
  active_slot integer,
  turn_seq integer not null default 0,
  winner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint rooms_code_unique unique (code),
  constraint rooms_code_format check (code ~ '^[A-Z0-9]{6}$'),
  constraint rooms_max_players_range check (max_players between 2 and 4),
  constraint rooms_active_slot_range check (
    active_slot is null
    or (active_slot >= 0 and active_slot < max_players)
  ),
  constraint rooms_turn_seq_nonneg check (turn_seq >= 0)
);

comment on table public.rooms is 'Online match rooms (lobby → playing → finished)';
comment on column public.rooms.code is 'Short join code (6 chars, unique); generated in create_room with collision retry';
comment on column public.rooms.track_id is 'Track JSON id (e.g. circuit-01)';
comment on column public.rooms.active_slot is 'Current turn slot while status = playing';
comment on column public.rooms.turn_seq is 'Monotonic turn sequence for launch/settle anti-replay';

create table public.room_members (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  slot_index integer not null,
  strokes integer not null default 0,
  connected boolean not null default true,
  last_seen_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),

  primary key (room_id, user_id),
  constraint room_members_slot_unique unique (room_id, slot_index),
  constraint room_members_slot_nonneg check (slot_index >= 0),
  constraint room_members_strokes_nonneg check (strokes >= 0)
);

comment on table public.room_members is 'Roster for an online room; capacity enforced by trigger + join_room';

create index room_members_user_id_idx on public.room_members (user_id);
create index rooms_host_id_idx on public.rooms (host_id);
create index rooms_status_idx on public.rooms (status);

-- Avoid RLS recursion when policies check membership
create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members m
    where m.room_id = p_room_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.generate_room_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  -- Omit I/O/0/1 to reduce join-code ambiguity
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::integer, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.enforce_room_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cap integer;
  cnt integer;
begin
  select r.max_players into cap
  from public.rooms r
  where r.id = new.room_id;

  if cap is null then
    raise exception 'room not found';
  end if;

  if new.slot_index >= cap then
    raise exception 'slot_index out of range for room capacity';
  end if;

  select count(*)::integer into cnt
  from public.room_members m
  where m.room_id = new.room_id;

  if cnt >= cap then
    raise exception 'room full';
  end if;

  return new;
end;
$$;

create trigger room_members_enforce_capacity
  before insert on public.room_members
  for each row execute function public.enforce_room_capacity();

create trigger rooms_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

-- Authenticated create: unique code retry + host as slot 0
create or replace function public.create_room(p_track_id text, p_max_players integer)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  new_code text;
  attempt integer := 0;
  new_room public.rooms;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_track_id is null or char_length(trim(p_track_id)) = 0 then
    raise exception 'track_id required';
  end if;

  if p_max_players is null or p_max_players < 2 or p_max_players > 4 then
    raise exception 'max_players must be between 2 and 4';
  end if;

  if not exists (select 1 from public.profiles p where p.id = uid) then
    raise exception 'profile required';
  end if;

  loop
    attempt := attempt + 1;
    if attempt > 20 then
      raise exception 'could not generate unique room code';
    end if;

    new_code := public.generate_room_code();

    begin
      insert into public.rooms (code, track_id, host_id, max_players, status)
      values (new_code, trim(p_track_id), uid, p_max_players, 'lobby')
      returning * into new_room;
      exit;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  insert into public.room_members (room_id, user_id, slot_index)
  values (new_room.id, uid, 0);

  return new_room;
end;
$$;

-- Authenticated join by code: lobby + capacity; idempotent if already member
create or replace function public.join_room(p_code text)
returns public.room_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  next_slot integer;
  new_member public.room_members;
  member_count integer;
  normalized text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (select 1 from public.profiles p where p.id = uid) then
    raise exception 'profile required';
  end if;

  normalized := upper(trim(p_code));
  if normalized is null or char_length(normalized) = 0 then
    raise exception 'code required';
  end if;

  select * into target
  from public.rooms r
  where r.code = normalized
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.status is distinct from 'lobby' then
    raise exception 'room not joinable';
  end if;

  if exists (
    select 1
    from public.room_members m
    where m.room_id = target.id
      and m.user_id = uid
  ) then
    select * into new_member
    from public.room_members m
    where m.room_id = target.id
      and m.user_id = uid;
    return new_member;
  end if;

  select count(*)::integer into member_count
  from public.room_members m
  where m.room_id = target.id;

  if member_count >= target.max_players then
    raise exception 'room full';
  end if;

  select coalesce(max(m.slot_index), -1) + 1 into next_slot
  from public.room_members m
  where m.room_id = target.id;

  insert into public.room_members (room_id, user_id, slot_index)
  values (target.id, uid, next_slot)
  returning * into new_member;

  return new_member;
end;
$$;

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- Direct INSERT denied (no insert policy): create/join only via RPCs
create policy "Members can select rooms"
  on public.rooms
  for select
  to authenticated
  using (public.is_room_member(id));

create policy "Host can update rooms"
  on public.rooms
  for update
  to authenticated
  using ((select auth.uid()) = host_id)
  with check ((select auth.uid()) = host_id);

create policy "Members can select room_members"
  on public.room_members
  for select
  to authenticated
  using (public.is_room_member(room_id));

-- Own row presence only (F03-C/E). Column grants block mutating
-- room_id / slot_index / user_id / strokes via PostgREST (CA3).
revoke update on table public.room_members from anon, authenticated;
grant update (connected, last_seen_at) on table public.room_members to authenticated;

create policy "Members can update own membership"
  on public.room_members
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant execute on function public.create_room(text, integer) to authenticated;
grant execute on function public.join_room(text) to authenticated;
grant execute on function public.is_room_member(uuid) to authenticated;

-- postgres_changes for lobby/match state (F03-C+)
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_members;

-- Private Realtime channel topic: room:{uuid}
-- Requires Realtime Authorization enabled on the project (private channels).
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'realtime'
      and table_name = 'messages'
  ) then
    execute $pol$
      create policy "Room members can receive realtime"
        on realtime.messages
        for select
        to authenticated
        using (
          (select realtime.topic()) like 'room:%'
          and public.is_room_member(
            nullif(replace((select realtime.topic()), 'room:', ''), '')::uuid
          )
        )
    $pol$;

    execute $pol$
      create policy "Room members can send realtime"
        on realtime.messages
        for insert
        to authenticated
        with check (
          (select realtime.topic()) like 'room:%'
          and public.is_room_member(
            nullif(replace((select realtime.topic()), 'room:', ''), '')::uuid
          )
        )
    $pol$;
  end if;
end;
$$;
