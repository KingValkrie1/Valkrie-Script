-- Permit an existing signed-in account to initialize its own settings row.
create policy notification_preferences_insert_self on public.notification_preferences
  for insert to authenticated
  with check (user_id = (select auth.uid()));

insert into public.notification_preferences (user_id)
select p.id from public.profiles p
on conflict (user_id) do nothing;
