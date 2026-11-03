-- StudyFlow one-phone license table
-- Run this in Supabase SQL Editor as the project owner.
create extension if not exists pgcrypto;

create table if not exists public.studyflow_licenses (
  id uuid primary key default gen_random_uuid(),
  license_hash text not null unique,
  status text not null default 'active'
    check (status in ('active', 'blocked', 'revoked')),
  device_id text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  last_seen_at timestamptz
);

alter table public.studyflow_licenses enable row level security;

-- Clients must never read or write this table directly.
revoke all on table public.studyflow_licenses from anon, authenticated;

-- CREATE A LICENSE:
-- Replace the example code with a unique random code and run:
-- insert into public.studyflow_licenses (license_hash)
-- values (encode(digest(upper(trim('SF-REPLACE-WITH-RANDOM-CODE')), 'sha256'), 'hex'));

-- BLOCK A LICENSE:
-- update public.studyflow_licenses
-- set status = 'blocked'
-- where license_hash = encode(digest(upper(trim('SF-REPLACE-WITH-RANDOM-CODE')), 'sha256'), 'hex');

-- REVOKE A LICENSE:
-- update public.studyflow_licenses
-- set status = 'revoked'
-- where license_hash = encode(digest(upper(trim('SF-REPLACE-WITH-RANDOM-CODE')), 'sha256'), 'hex');

-- RESET DEVICE (allows the buyer to activate on a replacement phone):
-- update public.studyflow_licenses
-- set device_id = null, activated_at = null
-- where license_hash = encode(digest(upper(trim('SF-REPLACE-WITH-RANDOM-CODE')), 'sha256'), 'hex');

-- Never store the original activation code in this table or commit real codes to GitHub.
