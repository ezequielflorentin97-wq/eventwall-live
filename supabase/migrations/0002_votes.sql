create table photo_votes (
  event_slug text not null,
  photo_id text not null,
  votes int not null default 0,
  primary key (event_slug, photo_id)
);

-- Same pattern as `events`: guests never query this table directly — the
-- vote API route (app/api/vote, app/api/votes) uses the service role key.
alter table photo_votes enable row level security;
