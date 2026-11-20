drop table if exists events;
drop table if exists plugins;
drop table if exists triggers;

create table if not exists screens (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  rainbow_source text not null,
  revision integer not null default 1,
  is_root boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table screens
  add column if not exists is_root boolean not null default false;

create unique index if not exists screens_single_root_idx
  on screens (is_root)
  where is_root = true;
