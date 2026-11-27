insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('request-attachments', 'request-attachments', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "request attachments are publicly readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'request-attachments');

create policy "users upload own request attachments" on storage.objects
  for insert to authenticated with check (bucket_id = 'request-attachments' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "users delete own request attachments" on storage.objects
  for delete to authenticated using (bucket_id = 'request-attachments' and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function public.get_my_request_quota()
returns table (membership_tier public.membership_tier, request_limit integer, request_count integer, remaining integer, resets_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  current_limit integer;
  used_count integer;
  oldest_active timestamptz;
begin
  if current_user_id is null then return; end if;
  current_limit := case when private.is_vip(current_user_id) then 3 else 1 end;
  select count(*)::integer, min(events.created_at) into used_count, oldest_active
  from (
    select e.created_at
    from private.request_quota_events e
    where e.user_id = current_user_id and e.created_at >= now() - interval '7 days'
    order by e.created_at desc
    limit current_limit
  ) events;
  return query select
    case when private.is_vip(current_user_id) then 'vip'::public.membership_tier else 'ordinary'::public.membership_tier end,
    current_limit,
    used_count,
    greatest(0, current_limit - used_count),
    case when used_count >= current_limit then oldest_active + interval '7 days' else null end;
end;
$$;
revoke all on function public.get_my_request_quota() from public, anon;
grant execute on function public.get_my_request_quota() to authenticated;
