create extension if not exists pgcrypto;

create type event_status as enum ('pagado_sin_configurar', 'activo', 'vencido');
create type event_tier as enum ('basico', 'estandar', 'premium');

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  status event_status not null default 'pagado_sin_configurar',
  tier event_tier not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  mp_payment_id text unique,
  config jsonb,
  created_at timestamptz not null default now(),
  configured_at timestamptz,
  -- Set when the wizard activates the event (configured_at + 30 days, see
  -- lib/retention.ts). The expiry cron (app/api/cron/expire-events) reads
  -- this to know which events to purge from Cloudinary and mark 'vencido'.
  expires_at timestamptz
);

create index events_status_idx on events (status);
create index events_expires_at_idx on events (expires_at) where status = 'activo';

-- RLS: no client (browser) traffic ever queries this table directly.
-- Only the server-side Supabase client (service role key, never exposed to
-- the browser) reads/writes `events`. Enabling RLS with no policies means
-- even a leaked anon key can't read or write event data.
alter table events enable row level security;
