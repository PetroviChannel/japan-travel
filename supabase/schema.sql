-- Shared travel budget: run the whole file in the Supabase SQL Editor as postgres.
-- PostgreSQL 15+; uses built-in sha256/gen_random_uuid, so no extension is needed.
-- Only the three public RPC functions are exposed. Keep trip_private unexposed.
-- No API key, room secret, or service-role credential belongs in this file.
begin;

create schema if not exists trip_private;
revoke all on schema trip_private from public, anon, authenticated;

create table if not exists trip_private.rooms (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  secret_hash bytea not null check (pg_catalog.octet_length(secret_hash) = 32),
  revision bigint not null default 1 check (revision > 0 and revision <= 9007199254740991),
  purchases jsonb not null default '{}'::jsonb
    check (pg_catalog.jsonb_typeof(purchases) = 'object')
    check (pg_catalog.octet_length(purchases::text) <= 1048576),
  created_at timestamptz not null default pg_catalog.clock_timestamp(),
  updated_at timestamptz not null default pg_catalog.clock_timestamp()
);

alter table trip_private.rooms enable row level security;
-- Deliberately no RLS policies and no client table privileges. RPCs check the
-- capability secret explicitly and run as the table-owning migration role.
revoke all on table trip_private.rooms from public, anon, authenticated;

create or replace function trip_private.valid_purchase(
  p_purchase jsonb,
  p_updated_at bigint
) returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $function$
declare
  v_id text;
  v_plan numeric;
  v_actual numeric;
  v_url text;
  v_client_time numeric;
begin
  if p_purchase is null
     or pg_catalog.jsonb_typeof(p_purchase) is distinct from 'object'
     or pg_catalog.octet_length(p_purchase::text) > 16384 then
    raise exception using errcode = '22023', message = 'Invalid purchase';
  end if;

  if p_purchase - array['id', 'paid', 'plan', 'actual', 'coupon', 'note', 'customUrl', 'updatedAt']::text[] <> '{}'::jsonb
     or pg_catalog.jsonb_typeof(p_purchase->'id') is distinct from 'string'
     or pg_catalog.jsonb_typeof(p_purchase->'paid') is distinct from 'boolean'
     or pg_catalog.jsonb_typeof(p_purchase->'plan') is distinct from 'number'
     or not (p_purchase ? 'actual')
     or pg_catalog.jsonb_typeof(p_purchase->'actual') not in ('number', 'null')
     or pg_catalog.jsonb_typeof(p_purchase->'coupon') is distinct from 'string'
     or pg_catalog.jsonb_typeof(p_purchase->'note') is distinct from 'string'
     or pg_catalog.jsonb_typeof(p_purchase->'customUrl') is distinct from 'string' then
    raise exception using errcode = '22023', message = 'Invalid purchase';
  end if;

  v_id := p_purchase->>'id';
  if v_id !~ '^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$'
     or v_id in ('constructor', 'prototype')
     or pg_catalog.length(p_purchase->>'coupon') > 100
     or pg_catalog.length(p_purchase->>'note') > 2000
     or pg_catalog.length(p_purchase->>'customUrl') > 2000 then
    raise exception using errcode = '22023', message = 'Invalid purchase';
  end if;

  v_plan := (p_purchase->>'plan')::numeric;
  v_actual := (p_purchase->>'actual')::numeric;
  if v_plan < 0 or v_plan > 10000000
     or (v_actual is not null and (v_actual < 0 or v_actual > 10000000)) then
    raise exception using errcode = '22023', message = 'Invalid purchase';
  end if;
  -- Match the app's two-decimal money normalization.
  v_plan := pg_catalog.round(v_plan, 2);
  v_actual := pg_catalog.round(v_actual, 2);
  if (p_purchase->>'paid')::boolean and v_actual is null then
    v_actual := v_plan;
  end if;

  -- Validate optional client metadata. The caller chooses the stored version:
  -- trip_create may preserve past history; trip_save always assigns server time.
  if p_purchase ? 'updatedAt' then
    if pg_catalog.jsonb_typeof(p_purchase->'updatedAt') is distinct from 'number' then
      raise exception using errcode = '22023', message = 'Invalid purchase';
    end if;
    v_client_time := (p_purchase->>'updatedAt')::numeric;
    if v_client_time < 0 or v_client_time > 9007199254740991
       or v_client_time <> pg_catalog.trunc(v_client_time) then
      raise exception using errcode = '22023', message = 'Invalid purchase';
    end if;
  end if;

  v_url := pg_catalog.btrim(p_purchase->>'customUrl');
  -- Absolute HTTP(S) only; reject credentials, whitespace, backslashes, and
  -- encoded authority characters. Links are never fetched by the database.
  -- ASCII/punycode hosts and IPv6 literals are accepted; the app also uses URL().
  if v_url <> '' and v_url !~* $url$^https?://([a-z0-9]([a-z0-9.-]*[a-z0-9])?|\[[a-f0-9:.]+\])(:[0-9]{1,5})?([/?#][^[:space:][:cntrl:]\\]*)?$$url$ then
    raise exception using errcode = '22023', message = 'Invalid purchase';
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_id,
    'paid', (p_purchase->>'paid')::boolean,
    'plan', v_plan,
    'actual', v_actual,
    'coupon', pg_catalog.btrim(p_purchase->>'coupon'),
    'note', pg_catalog.btrim(p_purchase->>'note'),
    'customUrl', v_url,
    'updatedAt', p_updated_at
  );
end;
$function$;

create or replace function public.trip_create(p_secret text, p_purchases jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_room uuid := pg_catalog.gen_random_uuid();
  v_purchases jsonb := '{}'::jsonb;
  v_entry record;
  v_purchase jsonb;
  v_now bigint := pg_catalog.floor(extract(epoch from pg_catalog.clock_timestamp()) * 1000)::bigint;
begin
  if p_secret is null or p_secret !~ '^[0-9a-fA-F]{64}$' then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;
  if p_purchases is null
     or pg_catalog.jsonb_typeof(p_purchases) is distinct from 'object'
     or pg_catalog.octet_length(p_purchases::text) > 1048576 then
    raise exception using errcode = '22023', message = 'Invalid purchases';
  end if;
  if (select pg_catalog.count(*) from pg_catalog.jsonb_object_keys(p_purchases)) > 300 then
    raise exception using errcode = '22023', message = 'Too many purchases';
  end if;

  for v_entry in select key, value from pg_catalog.jsonb_each(p_purchases) loop
    v_purchase := trip_private.valid_purchase(v_entry.value, v_now);
    if v_entry.key is distinct from v_purchase->>'id' then
      raise exception using errcode = '22023', message = 'Invalid purchases';
    end if;
    -- A new room has no prior concurrent version. Preserve validated historical
    -- timestamps so creating it does not make every row newer than real backups.
    -- Explicit 0 remains the untouched marker. Missing metadata uses server time;
    -- future client clocks are capped at server time and cannot poison versions.
    -- valid_purchase already checked the numeric type, integer range, and sign.
    if v_entry.value ? 'updatedAt' then
      v_purchase := pg_catalog.jsonb_set(
        v_purchase, '{updatedAt}',
        pg_catalog.to_jsonb(least((v_entry.value->>'updatedAt')::bigint, v_now))
      );
    end if;
    v_purchases := v_purchases || pg_catalog.jsonb_build_object(v_entry.key, v_purchase);
  end loop;
  if pg_catalog.octet_length(v_purchases::text) > 1048576 then
    raise exception using errcode = '22023', message = 'Purchases too large';
  end if;

  insert into trip_private.rooms (id, secret_hash, purchases)
  values (v_room, pg_catalog.sha256(pg_catalog.decode(p_secret, 'hex')), v_purchases);

  return pg_catalog.jsonb_build_object('room', v_room, 'revision', 1, 'purchases', v_purchases);
end;
$function$;

create or replace function public.trip_read(p_room uuid, p_secret text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_room trip_private.rooms%rowtype;
begin
  if p_secret is null or p_secret !~ '^[0-9a-fA-F]{64}$' then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;
  select r.* into v_room
  from trip_private.rooms as r
  where r.id = p_room
    and r.secret_hash = pg_catalog.sha256(pg_catalog.decode(p_secret, 'hex'));
  if not found then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;

  return pg_catalog.jsonb_build_object(
    'room', v_room.id, 'revision', v_room.revision, 'purchases', v_room.purchases
  );
end;
$function$;

create or replace function public.trip_save(
  p_room uuid,
  p_secret text,
  p_purchase jsonb,
  p_expected_updated_at bigint
) returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_room trip_private.rooms%rowtype;
  v_purchase jsonb;
  v_purchases jsonb;
  v_id text;
  v_previous_time bigint;
  v_now bigint;
begin
  if p_secret is null or p_secret !~ '^[0-9a-fA-F]{64}$' then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;

  -- Held until the RPC transaction commits: writers for this room serialize.
  -- Different items still merge because each writer changes only its own key.
  select r.* into v_room
  from trip_private.rooms as r
  where r.id = p_room
    and r.secret_hash = pg_catalog.sha256(pg_catalog.decode(p_secret, 'hex'))
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;
  if p_expected_updated_at is null or p_expected_updated_at < 0
     or p_expected_updated_at > 9007199254740991 then
    raise exception using errcode = '22023', message = 'Invalid expected timestamp';
  end if;

  v_purchase := trip_private.valid_purchase(p_purchase, 0);
  v_id := v_purchase->>'id';
  v_previous_time := coalesce((v_room.purchases->v_id->>'updatedAt')::bigint, 0);
  if v_previous_time <> p_expected_updated_at then
    return pg_catalog.jsonb_build_object(
      'room', v_room.id, 'revision', v_room.revision,
      'purchases', v_room.purchases, 'conflict', true
    );
  end if;

  if not (v_room.purchases ? v_id)
     and (select pg_catalog.count(*) from pg_catalog.jsonb_object_keys(v_room.purchases)) >= 300 then
    raise exception using errcode = '22023', message = 'Too many purchases';
  end if;

  -- Strictly increasing per item even for two writes in one millisecond or a
  -- backwards clock adjustment. Only the returned timestamp may be used next.
  v_now := greatest(
    pg_catalog.floor(extract(epoch from pg_catalog.clock_timestamp()) * 1000)::bigint,
    v_previous_time + 1
  );
  v_purchase := pg_catalog.jsonb_set(v_purchase, '{updatedAt}', pg_catalog.to_jsonb(v_now));
  v_purchases := v_room.purchases || pg_catalog.jsonb_build_object(v_id, v_purchase);
  if pg_catalog.octet_length(v_purchases::text) > 1048576 then
    raise exception using errcode = '22023', message = 'Purchases too large';
  end if;

  update trip_private.rooms as r
  set purchases = v_purchases,
      revision = r.revision + 1,
      updated_at = pg_catalog.clock_timestamp()
  where r.id = v_room.id
  returning r.* into v_room;

  return pg_catalog.jsonb_build_object(
    'room', v_room.id, 'revision', v_room.revision,
    'purchases', v_room.purchases, 'conflict', false
  );
end;
$function$;

-- Supabase projects may automatically grant new functions to client roles.
-- Explicitly remove every default grant before granting only the three RPCs.
revoke all on function trip_private.valid_purchase(jsonb, bigint) from public, anon, authenticated;
revoke all on function public.trip_create(text, jsonb) from public, anon, authenticated;
revoke all on function public.trip_read(uuid, text) from public, anon, authenticated;
revoke all on function public.trip_save(uuid, text, jsonb, bigint) from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant execute on function public.trip_create(text, jsonb) to anon, authenticated;
grant execute on function public.trip_read(uuid, text) to anon, authenticated;
grant execute on function public.trip_save(uuid, text, jsonb, bigint) to anon, authenticated;

comment on table trip_private.rooms is 'Capability-protected shared travel budgets; no direct client access.';
comment on function public.trip_save(uuid, text, jsonb, bigint) is 'One-item optimistic save. A conflict returns current state without writing.';

notify pgrst, 'reload schema';
commit;
