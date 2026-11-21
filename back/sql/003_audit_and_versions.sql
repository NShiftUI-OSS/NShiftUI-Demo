-- Versões publicadas são imutáveis. O update da tela cria outra linha.
-- O registro de auditoria guarda o que aconteceu, inclusive depois que a tela some.

alter table screen_versions
  add column if not exists name text;

alter table screen_versions
  add column if not exists description text not null default '';

alter table screen_versions
  add column if not exists is_root boolean not null default false;

update screen_versions as version
set
  name = screen.name,
  description = screen.description,
  is_root = screen.is_root
from screens as screen
where version.screen_id = screen.id
  and version.name is null;

alter table screen_versions
  alter column name set not null;

create or replace function forbid_screen_version_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'A versão % da tela já foi publicada e não pode ser alterada.', old.version
    using errcode = '55000';
end;
$$;

drop trigger if exists screen_versions_immutable on screen_versions;

create trigger screen_versions_immutable
  before update on screen_versions
  for each row
  execute function forbid_screen_version_update();

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_name text not null default '',
  summary text not null,
  version text,
  payload jsonb not null default '{}'::jsonb,
  constraint audit_logs_action_check
    check (action in ('screen.created', 'screen.published', 'screen.deleted')),
  constraint audit_logs_entity_check
    check (entity_type in ('screen'))
);

create index if not exists audit_logs_created_at_idx
  on audit_logs (created_at desc);

create index if not exists audit_logs_action_idx
  on audit_logs (action, created_at desc);
