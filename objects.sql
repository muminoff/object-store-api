drop database if exists objects;
create database objects;

\c objects;

create extension citext;
create extension "uuid-ossp";
create extension pgcrypto;
create extension tcn;
create extension plv8;

create table users (
  id bigserial primary key,
  username citext not null unique,
  email citext not null unique,
  password text not null,
  joined timestamp without time zone default now()
);

insert into users (username, email, password)
select 'user' || num, 'user' || num || '@example.com', crypt('password' || num, gen_salt('bf', 8))
from generate_series(1, 10) as num;

create table plans (
  id serial primary key,
  name text not null,
  space bigint,
  price numeric(5, 0) not null
);

insert into plans (name, space, price)
values
  ('free', (1024 * 1024 * 1024)::int8 * 1, 0),
  ('standard', (1024 * 1024 * 1024)::int8 * 5, 3000.00),
  ('premium', (1024 * 1024 * 1024)::int8 * 10, 5000.00);

create table user_tokens (
  id bigserial primary key,
  user_id bigint not null references users on delete cascade on update cascade,
  token text not null default replace(gen_random_uuid()::text, '-', '') || ':' || encode(digest(floor(extract(epoch from now()) * 1000)::text, 'sha1'), 'hex'),
  expires timestamp without time zone default now() + interval '3 days'
);

insert into user_tokens (user_id)
select id from users;

create table user_profiles (
  id bigserial primary key,
  user_id bigint not null references users on delete cascade on update cascade,
  plan_id integer not null references plans on delete cascade on update cascade,
  first_name citext,
  last_name citext,
  attrs jsonb
);

insert into user_profiles (user_id, plan_id)
select id, 1 from users;

create table user_storages (
  id bigserial primary key,
  user_id bigint not null references users on delete cascade on update cascade,
  main uuid not null default uuid_generate_v4(),
  trash uuid not null default uuid_generate_v4()
);

insert into user_storages (user_id)
select id from users;

create table storage_objects (
  id uuid not null primary key default uuid_generate_v4(),
  name citext not null check (name <> ''),
  is_dir bool default true,
  size bigint not null default 0,
  content_type citext,
  etag citext,
  parent uuid references storage_objects on delete cascade on update cascade,
  storage uuid not null,
  last_modified timestamp without time zone default now()
);

create unique index storage_objects_unique_idx on storage_objects(lower(name), is_dir, coalesce(parent, '00000000-0000-0000-0000-000000000000'), storage);
