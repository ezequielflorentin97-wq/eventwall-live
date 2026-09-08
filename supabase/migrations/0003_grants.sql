-- Fix: on this project, service_role lacked base table grants on
-- events/photo_votes (separate from RLS — RLS controls row visibility,
-- these GRANTs control whether the role can touch the table at all).
-- service_role bypasses RLS by its Postgres role attribute, but still
-- needs the underlying grant to do anything.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
