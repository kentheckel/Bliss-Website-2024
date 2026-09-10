-- One shared estimate, advanced by the database even when nobody visits.
create extension if not exists pg_cron;
create table public.asfc_network_counter (
  id text primary key check (id = 'network'),
  total_views bigint not null check (total_views between 0 and 9007199254740991),
  daily_growth bigint not null check (daily_growth between 0 and 1000000000),
  as_of_date date not null,
  is_estimate boolean not null default true
);
alter table public.asfc_network_counter enable row level security;
revoke all on public.asfc_network_counter from public, anon, authenticated;
grant select on public.asfc_network_counter to anon, authenticated;
create policy "Read the shared network estimate" on public.asfc_network_counter
  for select to anon, authenticated using (true);
insert into public.asfc_network_counter (id, total_views, daily_growth, as_of_date)
values ('network', 6800000000 + greatest(0, (now() at time zone 'UTC')::date - date '2026-09-09')::bigint * 1000000,
        1000000, (now() at time zone 'UTC')::date);

-- Repeated runs cannot double count; a delayed run catches up all missed days.
select cron.schedule('asfc-network-daily-growth', '0 0 * * *', $job$
  update public.asfc_network_counter
  set total_views = total_views + ((now() at time zone 'UTC')::date - as_of_date)::bigint * daily_growth,
      as_of_date = (now() at time zone 'UTC')::date
  where id = 'network' and as_of_date < (now() at time zone 'UTC')::date;
$job$);

-- Read-only RPC supplies server time so browser clocks cannot change the count.
-- Catch up the returned snapshot if the midnight job is briefly delayed.
create function public.asfc_network_snapshot()
returns table(total_views bigint, daily_growth bigint, as_of timestamptz, server_now timestamptz, is_estimate boolean)
language sql stable security invoker set search_path = '' as $$
 select c.total_views + greatest(0, (now() at time zone 'UTC')::date - c.as_of_date)::bigint * c.daily_growth,
        c.daily_growth, greatest(c.as_of_date, (now() at time zone 'UTC')::date)::timestamp at time zone 'UTC',
        now(), c.is_estimate
 from public.asfc_network_counter c where c.id = 'network';
$$;
revoke all on function public.asfc_network_snapshot() from public;
grant execute on function public.asfc_network_snapshot() to anon, authenticated;
