-- Valkrie Tools foundation: identity, membership, catalog, and public requests.
-- Apply in Supabase SQL Editor or with `supabase db push`.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.account_role as enum ('member', 'admin');
create type public.membership_tier as enum ('ordinary', 'vip');
create type public.request_status as enum ('pending', 'processing', 'completed', 'rejected', 'duplicate');
create type public.request_category as enum ('utility', 'web_tools', 'design_tools', 'developer_tools', 'productivity', 'other');
create type public.catalog_category as enum ('utility', 'web_tools', 'design_tools', 'developer_tools', 'productivity', 'other');

create sequence public.user_id_number_seq start 1;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id text not null unique,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 240),
  city text check (city is null or char_length(city) <= 80),
  role public.account_role not null default 'member',
  membership_tier public.membership_tier not null default 'ordinary',
  vip_expires_at timestamptz,
  vip_permanent boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null check (char_length(name) between 1 and 100),
  category public.catalog_category not null default 'other',
  description text not null default '',
  icon_url text,
  website_url text,
  is_premium boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tool_requests (
  id uuid primary key default gen_random_uuid(),
  request_number bigint generated always as identity unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  category public.request_category not null,
  description text not null check (char_length(description) between 10 and 5000),
  reference_url text,
  image_path text,
  tags text[] not null default '{}',
  status public.request_status not null default 'pending',
  admin_reply text,
  rejection_reason text,
  pinned boolean not null default false,
  hidden boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reference_url is null or reference_url ~ '^https?://'),
  check (cardinality(tags) <= 8),
  check (rejection_reason is null or status in ('rejected', 'duplicate'))
);

create table public.request_votes (
  request_id uuid not null references public.tool_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

-- Quota events survive request deletion so deleting a request cannot reset its weekly limit.
create table private.request_quota_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.tool_requests(id) on delete set null,
  created_at timestamptz not null default now()
);
create index request_quota_user_date_idx on private.request_quota_events (user_id, created_at desc);
revoke all on private.request_quota_events from public, anon, authenticated;

create table public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tool_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.request_bookmarks (
  request_id uuid not null references public.tool_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

create table public.tool_bookmarks (
  tool_id uuid not null references public.tools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tool_id, user_id)
);

create table public.vip_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('granted', 'extended', 'revoked', 'expired')),
  duration_days integer,
  permanent boolean not null default false,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create table public.admin_activity (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  request_replies boolean not null default true,
  request_status_changes boolean not null default true,
  vip_changes boolean not null default true,
  vip_expiry boolean not null default true,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  language text not null default 'id' check (language in ('id', 'en')),
  updated_at timestamptz not null default now()
);

create index tool_requests_public_feed_idx on public.tool_requests (pinned desc, created_at desc) where hidden = false;
create index tool_requests_status_idx on public.tool_requests (status, updated_at desc);
create index tool_requests_user_idx on public.tool_requests (user_id, created_at desc);
create index request_comments_request_idx on public.request_comments (request_id, created_at);
create index request_votes_request_idx on public.request_votes (request_id);
create index tools_published_idx on public.tools (category, updated_at desc) where is_published = true;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function private.is_vip(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = check_user_id
      and p.membership_tier = 'vip'
      and (p.vip_permanent or p.vip_expires_at > now())
  );
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_vip(uuid) to anon, authenticated;

-- Public profiles expose no email and hide city unless the member currently has VIP.
create view public.public_profiles with (security_barrier = true) as
select
  p.id,
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  case when private.is_vip(p.id) then p.city else null end as city,
  p.role,
  case when private.is_vip(p.id) then 'vip'::public.membership_tier else 'ordinary'::public.membership_tier end as membership_tier,
  case when private.is_vip(p.id) then p.vip_expires_at else null end as vip_expires_at,
  case when private.is_vip(p.id) then p.vip_permanent else false end as vip_permanent,
  p.joined_at
from public.profiles p;
grant select on public.public_profiles to anon, authenticated;

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested_username text;
  requested_name text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  requested_username := regexp_replace(requested_username, '[^a-z0-9_]', '_', 'g');
  requested_username := left(requested_username, 24);
  if char_length(requested_username) < 3 then
    requested_username := 'user_' || left(replace(new.id::text, '-', ''), 12);
  end if;
  requested_name := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), requested_username), 40);

  insert into public.profiles (id, user_id, username, display_name)
  values (
    new.id,
    'VALK-' || lpad(nextval('public.user_id_number_seq')::text, 6, '0'),
    requested_username,
    requested_name
  );
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger auth_user_created_profile
  after insert on auth.users
  for each row execute function private.create_user_profile();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger tools_updated_at before update on public.tools
  for each row execute function private.touch_updated_at();
create trigger requests_updated_at before update on public.tool_requests
  for each row execute function private.touch_updated_at();
create trigger comments_updated_at before update on public.request_comments
  for each row execute function private.touch_updated_at();

-- RLS keeps account roles, VIP state, request moderation fields, and admin logs server-managed.
create or replace function private.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() = old.id and not private.is_admin() then
    if new.id is distinct from old.id
      or new.user_id is distinct from old.user_id
      or new.username is distinct from old.username
      or new.role is distinct from old.role
      or new.membership_tier is distinct from old.membership_tier
      or new.vip_expires_at is distinct from old.vip_expires_at
      or new.vip_permanent is distinct from old.vip_permanent
      or new.joined_at is distinct from old.joined_at then
      raise exception 'Protected profile fields cannot be changed by the account owner';
    end if;
    if new.city is distinct from old.city and not private.is_vip(old.id) then
      raise exception 'Only VIP members can set a request city';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_fields before update on public.profiles
  for each row execute function private.protect_profile_fields();

create or replace function private.protect_request_moderation_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() = old.user_id and not private.is_admin() then
    if new.id is distinct from old.id
      or new.request_number is distinct from old.request_number
      or new.user_id is distinct from old.user_id
      or new.created_at is distinct from old.created_at
      or new.status is distinct from old.status
      or new.admin_reply is distinct from old.admin_reply
      or new.rejection_reason is distinct from old.rejection_reason
      or new.pinned is distinct from old.pinned
      or new.hidden is distinct from old.hidden
      or new.completed_at is distinct from old.completed_at then
      raise exception 'Moderation fields can only be changed by an admin';
    end if;
  end if;
  return new;
end;
$$;

create trigger requests_protect_moderation_fields before update on public.tool_requests
  for each row execute function private.protect_request_moderation_fields();

create or replace function private.enforce_request_quota()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  weekly_limit integer;
  recent_count integer;
begin
  new.created_at := now();
  new.updated_at := now();
  if private.is_admin() then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  weekly_limit := case when private.is_vip(new.user_id) then 3 else 1 end;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  select count(*) into recent_count
    from private.request_quota_events e
    where e.user_id = new.user_id and e.created_at >= now() - interval '7 days';
  if recent_count >= weekly_limit then
    raise exception 'Weekly request quota reached';
  end if;
  return new;
end;
$$;

create trigger requests_enforce_quota before insert on public.tool_requests
  for each row execute function private.enforce_request_quota();

create or replace function private.record_request_quota_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into private.request_quota_events (user_id, request_id) values (new.user_id, new.id);
  return new;
end;
$$;

create trigger requests_record_quota_event after insert on public.tool_requests
  for each row execute function private.record_request_quota_event();

create or replace function private.audit_profile_changes()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  recorded_action text;
  duration_left integer;
  change_note text;
begin
  if old.membership_tier is distinct from new.membership_tier
     or old.vip_expires_at is distinct from new.vip_expires_at
     or old.vip_permanent is distinct from new.vip_permanent then
    recorded_action := case
      when new.membership_tier = 'vip' and old.membership_tier = 'vip' and (old.vip_permanent or old.vip_expires_at > now()) then 'extended'
      when new.membership_tier = 'vip' then 'granted'
      else 'revoked'
    end;
    duration_left := case when new.vip_expires_at is null then null else greatest(0, ceil(extract(epoch from (new.vip_expires_at - now())) / 86400)::integer) end;
    change_note := nullif(current_setting('app.vip_note', true), '');
    insert into public.vip_history (user_id, changed_by, action, duration_days, permanent, note)
    values (new.id, auth.uid(), recorded_action, duration_left, new.vip_permanent, change_note);
    insert into public.admin_activity (admin_id, action, target_type, target_id, details)
    values (auth.uid(), 'vip.' || recorded_action, 'user', new.user_id, jsonb_build_object('duration_days', duration_left, 'permanent', new.vip_permanent, 'note', change_note));
  end if;

  if old.role is distinct from new.role then
    insert into public.admin_activity (admin_id, action, target_type, target_id, details)
    values (auth.uid(), 'user.role_changed', 'user', new.user_id, jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  return new;
end;
$$;

create trigger profiles_audit_admin_changes after update on public.profiles
  for each row execute function private.audit_profile_changes();

create or replace function public.admin_manage_vip(
  target_user_id text,
  operation text,
  duration_days integer default null,
  permanent boolean default false,
  note text default null
)
returns table (id uuid, user_id text, username text, display_name text, membership_tier public.membership_tier, vip_expires_at timestamptz, vip_permanent boolean)
language plpgsql security definer set search_path = '' as $$
declare
  target_profile public.profiles%rowtype;
  expiry_base timestamptz;
begin
  if not private.is_admin() then raise exception 'Admin access required'; end if;
  if target_user_id is null or char_length(target_user_id) > 32 then raise exception 'Invalid user ID'; end if;
  if note is not null and char_length(note) > 500 then raise exception 'Note is too long'; end if;

  select p.* into target_profile from public.profiles p where upper(p.user_id) = upper(target_user_id) for update;
  if not found then raise exception 'User ID not found'; end if;

  if operation = 'revoke' then
    if target_profile.membership_tier <> 'vip' then raise exception 'User does not have VIP'; end if;
    perform set_config('app.vip_note', coalesce(trim(note), ''), true);
    update public.profiles p set membership_tier = 'ordinary', vip_expires_at = null, vip_permanent = false where p.id = target_profile.id;
  elsif operation in ('grant', 'extend') then
    if not permanent and (duration_days is null or duration_days not in (7, 30, 365)) then raise exception 'Choose 7, 30, or 365 days'; end if;
    if operation = 'grant' and private.is_vip(target_profile.id) then raise exception 'User already has active VIP; use extend'; end if;
    if operation = 'extend' and not private.is_vip(target_profile.id) then raise exception 'User has no active VIP to extend'; end if;
    if operation = 'extend' and target_profile.vip_permanent then raise exception 'Permanent VIP cannot be extended'; end if;

    expiry_base := case
      when operation = 'extend' then greatest(coalesce(target_profile.vip_expires_at, now()), now())
      else now()
    end;
    perform set_config('app.vip_note', coalesce(trim(note), ''), true);
    update public.profiles p
      set membership_tier = 'vip',
          vip_permanent = permanent,
          vip_expires_at = case when permanent then null else expiry_base + make_interval(days => duration_days) end
      where p.id = target_profile.id;
  else
    raise exception 'Invalid VIP operation';
  end if;

  return query select p.id, p.user_id, p.username, p.display_name, p.membership_tier, p.vip_expires_at, p.vip_permanent
    from public.profiles p where p.id = target_profile.id;
end;
$$;
revoke all on function public.admin_manage_vip(text, text, integer, boolean, text) from public, anon;
grant execute on function public.admin_manage_vip(text, text, integer, boolean, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.tools enable row level security;
alter table public.tool_requests enable row level security;
alter table public.request_votes enable row level security;
alter table public.request_comments enable row level security;
alter table public.request_bookmarks enable row level security;
alter table public.tool_bookmarks enable row level security;
alter table public.vip_history enable row level security;
alter table public.admin_activity enable row level security;
alter table public.notification_preferences enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.tools, public.tool_requests, public.request_votes, public.request_comments to anon, authenticated;
grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.tools to authenticated;
grant insert, update, delete on public.tool_requests to authenticated;
grant insert on public.request_votes to authenticated;
grant insert, update, delete on public.request_comments to authenticated;
grant select, insert, delete on public.request_bookmarks, public.tool_bookmarks to authenticated;
grant select, insert, update on public.notification_preferences to authenticated;
grant select, insert on public.vip_history, public.admin_activity to authenticated;

create policy profiles_read_self_or_admin on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

create policy tools_read_published_or_admin on public.tools for select to anon, authenticated
  using ((is_published and (not is_premium or (select private.is_vip((select auth.uid()))))) or (select private.is_admin()));
create policy tools_admin_insert on public.tools for insert to authenticated with check ((select private.is_admin()));
create policy tools_admin_update on public.tools for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy tools_admin_delete on public.tools for delete to authenticated using ((select private.is_admin()));

create policy requests_read_visible on public.tool_requests for select to anon, authenticated
  using (not hidden or user_id = (select auth.uid()) or (select private.is_admin()));
create policy requests_create_self on public.tool_requests for insert to authenticated
  with check (user_id = (select auth.uid()) and not pinned and not hidden and status = 'pending' and admin_reply is null);
create policy requests_update_owner_before_reply on public.tool_requests for update to authenticated
  using ((user_id = (select auth.uid()) and admin_reply is null) or (select private.is_admin()))
  with check ((user_id = (select auth.uid()) and admin_reply is null) or (select private.is_admin()));
create policy requests_delete_owner_before_reply_or_admin on public.tool_requests for delete to authenticated
  using ((user_id = (select auth.uid()) and admin_reply is null) or (select private.is_admin()));

create policy votes_read_visible_requests on public.request_votes for select to anon, authenticated using (
  exists (select 1 from public.tool_requests r where r.id = request_id and (not r.hidden or (select private.is_admin())))
);
create policy votes_add_once on public.request_votes for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.tool_requests r where r.id = request_id and not r.hidden)
);

create policy comments_read_visible_requests on public.request_comments for select to anon, authenticated using (
  exists (select 1 from public.tool_requests r where r.id = request_id and (not r.hidden or (select private.is_admin())))
);
create policy comments_add_self on public.request_comments for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.tool_requests r where r.id = request_id and not r.hidden)
);
create policy comments_update_self on public.request_comments for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy comments_delete_self_or_admin on public.request_comments for delete to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy request_bookmarks_owner on public.request_bookmarks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy tool_bookmarks_owner on public.tool_bookmarks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy vip_history_admin_read on public.vip_history for select to authenticated using ((select private.is_admin()));
create policy vip_history_admin_add on public.vip_history for insert to authenticated with check ((select private.is_admin()));
create policy admin_activity_admin_read on public.admin_activity for select to authenticated using ((select private.is_admin()));
create policy admin_activity_admin_add on public.admin_activity for insert to authenticated with check ((select private.is_admin()));

create policy notification_preferences_self on public.notification_preferences for select to authenticated using (user_id = (select auth.uid()));
create policy notification_preferences_update_self on public.notification_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Public board view exposes only visible requests and safe public profile fields.
create view public.public_request_board with (security_barrier = true) as
select
  r.id,
  r.request_number,
  r.user_id as author_uuid,
  p.user_id as author_user_id,
  p.username as author_username,
  p.display_name as author_name,
  p.avatar_url as author_avatar_url,
  p.role as author_role,
  p.membership_tier as author_membership_tier,
  p.city as author_city,
  r.name,
  r.category,
  r.description,
  r.reference_url,
  r.image_path,
  r.tags,
  r.status,
  r.admin_reply,
  r.rejection_reason,
  r.pinned,
  r.created_at,
  r.updated_at,
  r.completed_at,
  count(distinct v.user_id)::integer as vote_count,
  count(distinct c.id)::integer as comment_count
from public.tool_requests r
join public.public_profiles p on p.id = r.user_id
left join public.request_votes v on v.request_id = r.id
left join public.request_comments c on c.request_id = r.id
where not r.hidden
group by r.id, p.id;
grant select on public.public_request_board to anon, authenticated;
