create table if not exists lab_definitions (
  id text primary key,
  definition text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists detection_rules (
  id text primary key,
  name text not null,
  enabled boolean not null default true,
  logic text not null default 'and',
  conditions text not null,
  pack text not null default 'custom',
  created_at timestamptz not null default now()
);

create table if not exists ioc_entries (
  id text primary key,
  kind text not null,
  value text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists saved_queries (
  id text primary key,
  name text not null,
  query text not null,
  created_at timestamptz not null default now()
);

create table if not exists verdict_audit (
  id text primary key,
  sample_id text not null,
  lab_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists engine_analytics (
  id text primary key,
  event text not null,
  sample_id text,
  lab_id text,
  rule_id text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists verdict_audit_sample_idx on verdict_audit (sample_id);
create index if not exists engine_analytics_event_idx on engine_analytics (event);
