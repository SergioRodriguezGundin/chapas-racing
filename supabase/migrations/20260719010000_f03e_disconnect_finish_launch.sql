-- F03-E: disconnect skip, finish/ranking, server-side launch validation
-- Ref: progress/research_f03_realtime_sync.md §2, §3, §7; feature_list.json F03-E

alter table public.rooms
  add column if not exists turn_started_at timestamptz,
  add column if not exists launch_pending boolean not null default false;

comment on column public.rooms.turn_started_at is
  'When current turn became active (start / settle / skip). Used with client disconnect timeout.';
comment on column public.rooms.launch_pending is
  'True after submit_room_launch until settle/skip; blocks double launch same turn_seq.';

create or replace function public.room_dense_user(
  p_room_id uuid,
  p_dense_slot integer
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id
  from public.room_members m
  where m.room_id = p_room_id
  order by m.slot_index asc
  offset greatest(p_dense_slot, 0)
  limit 1;
$$;

comment on function public.room_dense_user(uuid, integer) is
  'Maps dense active_slot (0..n-1) to user_id via slot_index order.';

create or replace function public.start_room(p_room_id uuid)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  member_count integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.host_id is distinct from uid then
    raise exception 'only host can start';
  end if;

  if target.status is distinct from 'lobby' then
    raise exception 'room not startable';
  end if;

  select count(*)::integer into member_count
  from public.room_members m
  where m.room_id = p_room_id;

  if member_count < 2 then
    raise exception 'need at least 2 players';
  end if;

  update public.rooms r
  set
    status = 'playing',
    started_at = now(),
    active_slot = 0,
    turn_seq = 0,
    turn_started_at = now(),
    launch_pending = false,
    winner_id = null,
    finished_at = null
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

drop function if exists public.commit_room_settle(uuid, integer, integer);

create or replace function public.commit_room_settle(
  p_room_id uuid,
  p_turn_seq integer,
  p_next_active_slot integer,
  p_strokes jsonb default null
)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  member_count integer;
  member_row record;
  dense_idx integer := 0;
  stroke_val integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  if p_turn_seq is null or p_turn_seq < 0 then
    raise exception 'turn_seq invalid';
  end if;

  if p_next_active_slot is null or p_next_active_slot < 0 then
    raise exception 'active_slot invalid';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'not a room member';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.status is distinct from 'playing' then
    raise exception 'room not playing';
  end if;

  if target.turn_seq is distinct from p_turn_seq then
    return target;
  end if;

  select count(*)::integer into member_count
  from public.room_members m
  where m.room_id = p_room_id;

  if member_count = 0 or p_next_active_slot >= member_count then
    raise exception 'active_slot out of range';
  end if;

  if p_strokes is not null and jsonb_typeof(p_strokes) = 'array' then
    for member_row in
      select m.user_id
      from public.room_members m
      where m.room_id = p_room_id
      order by m.slot_index asc
    loop
      stroke_val := (p_strokes ->> dense_idx)::integer;
      if stroke_val is not null and stroke_val >= 0 then
        update public.room_members m
        set strokes = stroke_val
        where m.room_id = p_room_id
          and m.user_id = member_row.user_id;
      end if;
      dense_idx := dense_idx + 1;
    end loop;
  end if;

  update public.rooms r
  set
    active_slot = p_next_active_slot,
    turn_seq = p_turn_seq + 1,
    turn_started_at = now(),
    launch_pending = false
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

comment on function public.commit_room_settle(uuid, integer, integer, jsonb) is
  'Advances active_slot/turn_seq after settle; optional dense strokes[]; clears launch_pending.';

create or replace function public.submit_room_launch(
  p_room_id uuid,
  p_turn_seq integer,
  p_direction jsonb,
  p_power double precision,
  p_from jsonb default null
)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  active_uid uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  if p_turn_seq is null or p_turn_seq < 0 then
    raise exception 'turn_seq invalid';
  end if;

  if p_direction is null or jsonb_typeof(p_direction) is distinct from 'array' then
    raise exception 'direction invalid';
  end if;

  if p_power is null or p_power < 0 or p_power > 1 then
    raise exception 'power invalid';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'not a room member';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.status is distinct from 'playing' then
    raise exception 'room not playing';
  end if;

  if target.turn_seq is distinct from p_turn_seq then
    raise exception 'turn_seq mismatch';
  end if;

  if target.launch_pending then
    raise exception 'launch already submitted';
  end if;

  if target.active_slot is null then
    raise exception 'no active slot';
  end if;

  active_uid := public.room_dense_user(p_room_id, target.active_slot);

  if active_uid is null or active_uid is distinct from uid then
    raise exception 'not active player';
  end if;

  update public.rooms r
  set launch_pending = true
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

comment on function public.submit_room_launch(uuid, integer, jsonb, double precision, jsonb) is
  'Server gate: only dense-active member with matching turn_seq may launch; sets launch_pending.';

create or replace function public.skip_room_turn(
  p_room_id uuid,
  p_turn_seq integer
)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  member_count integer;
  active_uid uuid;
  active_connected boolean;
  active_last_seen timestamptz;
  next_slot integer;
  -- Keep in sync with src/config/online.ts ONLINE.disconnectTurnTimeoutMs
  stale_secs integer := 15;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  if p_turn_seq is null or p_turn_seq < 0 then
    raise exception 'turn_seq invalid';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'not a room member';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.status is distinct from 'playing' then
    raise exception 'room not playing';
  end if;

  if target.turn_seq is distinct from p_turn_seq then
    return target;
  end if;

  select count(*)::integer into member_count
  from public.room_members m
  where m.room_id = p_room_id;

  if member_count < 2 or target.active_slot is null then
    raise exception 'cannot skip turn';
  end if;

  active_uid := public.room_dense_user(p_room_id, target.active_slot);

  select m.connected, m.last_seen_at
  into active_connected, active_last_seen
  from public.room_members m
  where m.room_id = p_room_id
    and m.user_id = active_uid;

  if active_uid is null then
    raise exception 'active member missing';
  end if;

  if active_connected
     and active_last_seen is not null
     and active_last_seen > (now() - make_interval(secs => stale_secs))
  then
    raise exception 'active player still present';
  end if;

  next_slot := (target.active_slot + 1) % member_count;

  update public.rooms r
  set
    active_slot = next_slot,
    turn_seq = p_turn_seq + 1,
    turn_started_at = now(),
    launch_pending = false
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

comment on function public.skip_room_turn(uuid, integer) is
  'Advances turn when dense-active member is disconnected/stale; no-op on turn_seq mismatch.';

create or replace function public.finish_room(
  p_room_id uuid,
  p_winner_user_id uuid,
  p_ranking jsonb
)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  entry jsonb;
  entry_uid uuid;
  entry_strokes integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  if p_winner_user_id is null then
    raise exception 'winner required';
  end if;

  if p_ranking is null or jsonb_typeof(p_ranking) is distinct from 'array' then
    raise exception 'ranking invalid';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'not a room member';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.status = 'finished' then
    return target;
  end if;

  if target.status is distinct from 'playing' then
    raise exception 'room not playing';
  end if;

  if not exists (
    select 1
    from public.room_members m
    where m.room_id = p_room_id
      and m.user_id = p_winner_user_id
  ) then
    raise exception 'winner not a member';
  end if;

  for entry in select * from jsonb_array_elements(p_ranking)
  loop
    entry_uid := (entry ->> 'user_id')::uuid;
    entry_strokes := (entry ->> 'strokes')::integer;
    if entry_uid is null or entry_strokes is null or entry_strokes < 0 then
      raise exception 'ranking entry invalid';
    end if;
    update public.room_members m
    set strokes = entry_strokes
    where m.room_id = p_room_id
      and m.user_id = entry_uid;
  end loop;

  update public.rooms r
  set
    status = 'finished',
    winner_id = p_winner_user_id,
    finished_at = now(),
    launch_pending = false
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

comment on function public.finish_room(uuid, uuid, jsonb) is
  'Marks room finished; writes winner_id + room_members.strokes from ranking [{user_id, strokes}].';

grant execute on function public.room_dense_user(uuid, integer) to authenticated;
grant execute on function public.submit_room_launch(uuid, integer, jsonb, double precision, jsonb) to authenticated;
grant execute on function public.skip_room_turn(uuid, integer) to authenticated;
grant execute on function public.finish_room(uuid, uuid, jsonb) to authenticated;
grant execute on function public.commit_room_settle(uuid, integer, integer, jsonb) to authenticated;
