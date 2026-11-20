-- SemVer das telas.
--
-- screens.revision continua o token de concorrência do PUT.
-- screens.version é o SemVer que o editor mostra.
--
-- Telas que já existiam: o patch recebe a revisão inteira atual.
-- Revisão 1 vira 1.0.1 e revisão 6 vira 1.0.6. Não há Rainbow das revisões
-- anteriores, então o histórico começa com o Rainbow que está na linha.
--
-- Telas novas: version nasce em 1.0.0. A revision segue o default 1.
-- Cada gravação que muda nome, descrição, Rainbow ou root soma 1 no patch
-- (1.0.0 → 1.0.1) e insere uma linha em screen_versions.
-- Conteúdo idêntico não altera revision nem version.
--
-- Cada comando é idempotente. O script não abre transação: o driver do Node
-- recusa BEGIN explícito na conexão do pool. Se um comando falhar, rodar de
-- novo continua do estado que ficou.

alter table screens
  add column if not exists version text;

update screens
set version = '1.0.' || revision::text
where version is null
   or version !~ '^[0-9]+\.[0-9]+\.[0-9]+$';

alter table screens
  alter column version set default '1.0.0';

alter table screens
  alter column version set not null;

alter table screens
  drop constraint if exists screens_version_semver;

alter table screens
  add constraint screens_version_semver
  check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$');

create table if not exists screen_versions (
  screen_id uuid not null references screens (id) on delete cascade,
  version text not null,
  rainbow_source text not null,
  created_at timestamptz not null default now(),
  primary key (screen_id, version),
  constraint screen_versions_version_semver
    check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

insert into screen_versions (screen_id, version, rainbow_source, created_at)
select s.id, s.version, s.rainbow_source, s.updated_at
from screens s
where not exists (
  select 1
  from screen_versions v
  where v.screen_id = s.id
    and v.version = s.version
);
