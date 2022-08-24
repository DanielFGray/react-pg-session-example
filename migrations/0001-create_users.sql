-- migrate:down
drop table hidden.sessions;
drop schema hidden;
drop table users;
drop extension citext;

-- migrate:up
create extension if not exists citext;

create table users (
  user_id uuid primary key default gen_random_uuid(),
  username citext not null unique check(length(username) between 1 and 64),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create schema if not exists hidden;

-- unlogged tables do not write to the wal,
-- so they are faster at the expense of not being crash resilient
create unlogged table hidden.sessions (
  sid text primary key not null,
  sess json not null,
  expire timestamptz not null
);
