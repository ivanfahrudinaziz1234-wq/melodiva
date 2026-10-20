-- Melodiva: initial schema (admin, inbox, bookings, analytics, audit, rate limits)
-- RLS is enabled on every table. The public (anon) role has no read/update/delete
-- access anywhere; public inserts (messages, page_views) only happen in server
-- routes that use the service-role key.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin membership
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  notification_email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users au where au.id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Messages (contact form)
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique,
  name text not null,
  whatsapp text not null,
  email text not null,
  event_type text not null,
  event_date date,
  location text,
  guests integer,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'done', 'spam', 'archived')),
  is_read boolean not null default false,
  internal_note text,
  ip_hash text,
  user_agent text,
  idempotency_key text unique,
  email_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists messages_status_created_idx on public.messages (status, created_at desc);
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists messages_ip_hash_idx on public.messages (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Replies sent from the admin panel
-- ---------------------------------------------------------------------------
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  subject text not null,
  body text not null,
  sent_by uuid references public.admin_users(id) on delete set null,
  resend_email_id text,
  delivery_status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists replies_message_idx on public.replies (message_id, created_at);

create table if not exists public.reply_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Bookings (PRIVATE, admin only, never exposed publicly)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete set null,
  client_name text not null,
  whatsapp text not null,
  event_type text not null,
  package_slug text,
  event_date date not null,
  start_time time,
  venue text,
  lineup text,
  status text not null default 'negotiating'
    check (status in ('negotiating', 'tentative', 'deal', 'done', 'cancelled')),
  agreed_price numeric(14, 2),
  payment_notes text,
  notes text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_event_date_idx on public.bookings (event_date);
create index if not exists bookings_status_idx on public.bookings (status);

-- Same-day conflicts between active bookings
create or replace view public.booking_conflicts
with (security_invoker = true) as
select a.id as booking_id, b.id as conflicting_id, a.event_date
from public.bookings a
join public.bookings b
  on a.event_date = b.event_date and a.id <> b.id
where a.status <> 'cancelled' and b.status <> 'cancelled';

-- ---------------------------------------------------------------------------
-- Analytics (privacy-friendly, no raw IPs)
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer_source text not null default 'direct'
    check (referrer_source in ('instagram', 'whatsapp', 'google', 'direct', 'other')),
  referrer_host text,
  device text check (device in ('mobile', 'tablet', 'desktop')),
  browser text,
  os text,
  country text,
  city text,
  visitor_hash text not null,
  session_hash text,
  is_bot boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_visitor_idx on public.page_views (visitor_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Rate limits (fallback when Upstash is not configured) + idempotency keys
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
          when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else rl.count + 1
        end,
        window_start = case
          when rl.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else rl.window_start
        end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists messages_updated_at on public.messages;
create trigger messages_updated_at before update on public.messages
  for each row execute function public.set_updated_at();
drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();
drop trigger if exists reply_templates_updated_at on public.reply_templates;
create trigger reply_templates_updated_at before update on public.reply_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.messages enable row level security;
alter table public.replies enable row level security;
alter table public.reply_templates enable row level security;
alter table public.bookings enable row level security;
alter table public.page_views enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;

-- admin_users: admins can see the member list; changes go through SQL / service role.
create policy admin_users_select on public.admin_users for select to authenticated using (public.is_admin());
create policy admin_users_update_self on public.admin_users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy messages_admin_select on public.messages for select to authenticated using (public.is_admin());
create policy messages_admin_update on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messages_admin_delete on public.messages for delete to authenticated using (public.is_admin());

create policy replies_admin_all on public.replies for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy reply_templates_admin_all on public.reply_templates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy bookings_admin_all on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy page_views_admin_select on public.page_views for select to authenticated using (public.is_admin());

create policy audit_logs_admin_select on public.audit_logs for select to authenticated using (public.is_admin());
create policy audit_logs_admin_insert on public.audit_logs for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

-- rate_limits: no policies -> only the service role can touch it.

-- ---------------------------------------------------------------------------
-- Default reply templates
-- ---------------------------------------------------------------------------
insert into public.reply_templates (title, subject, body)
select * from (values
  ('Terima kasih & info ketersediaan', 'Terima kasih telah menghubungi Melodiva',
   E'Halo {nama},\n\nTerima kasih sudah menghubungi Melodiva. Tanggal acara Anda masih tersedia. Agar kami bisa menyiapkan penawaran terbaik, boleh kami tahu detail susunan acara dan durasi tampil yang diinginkan?\n\nSalam hangat,\nMelodiva'),
  ('Penawaran harga', 'Penawaran Melodiva untuk acara Anda',
   E'Halo {nama},\n\nBerikut penawaran kami untuk acara Anda. Silakan balas email ini atau hubungi kami via WhatsApp untuk diskusi lebih lanjut.\n\nSalam hangat,\nMelodiva'),
  ('Tanggal sudah terisi', 'Mohon maaf, tanggal sudah terisi',
   E'Halo {nama},\n\nTerima kasih atas minat Anda. Mohon maaf, pada tanggal tersebut jadwal kami sudah terisi. Jika tanggal acara masih fleksibel, kami dengan senang hati membantu di tanggal lain.\n\nSalam hangat,\nMelodiva')
) as t(title, subject, body)
where not exists (select 1 from public.reply_templates);

-- ---------------------------------------------------------------------------
-- First admin (run manually after creating the user in Supabase Auth):
--   insert into public.admin_users (id, email, role)
--   select id, email, 'owner' from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------------
