drop database if exists objects;
create database objects;

\c objects;

create extension citext;
create extension "uuid-ossp";

create table objects (
  id uuid not null primary key default uuid_generate_v4(),
  name citext not null,
  is_dir bool default true,
  size bigint,
  content_type citext,
  etag citext,
  last_modified timestamp without time zone default now(),
  parent uuid references objects
);

create unique index on objects(lower(name), coalesce(parent, '00000000-0000-0000-0000-000000000000'));

insert into objects (name)
select 'dir-' || num
from generate_series(1, 100) as num;
