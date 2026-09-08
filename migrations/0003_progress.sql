create table if not exists progress_attempts (
  id text primary key,
  session_id text not null,
  lab_id text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  completed_at timestamptz not null default now()
);

create index if not exists progress_attempts_session_idx on progress_attempts (session_id, completed_at desc);
