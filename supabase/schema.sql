create extension if not exists pgcrypto;

create table if not exists hub_registrations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  full_name text,
  app_id text not null,
  app_name text,
  app_price_cents integer,
  app_currency text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table hub_registrations add column if not exists app_name text;
alter table hub_registrations add column if not exists app_price_cents integer;
alter table hub_registrations add column if not exists app_currency text;

drop index if exists hub_registrations_unique_email_app;
create unique index if not exists hub_registrations_unique_email_app_active
  on hub_registrations (email_normalized, app_id)
  where status = 'active';

create table if not exists hub_access_links (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references hub_registrations(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists hub_access_links_registration_idx
  on hub_access_links (registration_id);

create table if not exists hub_access_events (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references hub_registrations(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists hub_access_events_registration_idx
  on hub_access_events (registration_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
--  hub_licenses  (Live-Lizenzen – wird bei Erstaktivierung angelegt)
-- ─────────────────────────────────────────────────────────────────────────────
--  license_key  : wird in .env des Kunden gespeichert; bei jedem Start online
--                 geprüft → Revocation möglich; kein reines LICENSE_ACTIVATED=1
--  max_gpts     : 0 = unbegrenzt; >0 = Limit (z.B. 10 für Pilot-Upgrade)
--  status       : active | suspended | expired
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists hub_licenses (
  id              uuid        primary key default gen_random_uuid(),
  registration_id uuid        not null references hub_registrations(id) on delete cascade,
  license_key     text        not null unique,
  max_gpts        integer     not null default 0,
  status          text        not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hub_licenses_registration_idx
  on hub_licenses (registration_id);

create unique index if not exists hub_licenses_key_idx
  on hub_licenses (license_key);
