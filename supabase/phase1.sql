-- AI news stream
create table if not exists ai_news_stream (
  id bigserial primary key,
  source text not null,
  source_url text not null,
  headline text not null,
  summary text not null,
  topics text[] default '{}',
  published_at timestamptz not null,
  created_at timestamptz default now(),
  featured boolean default false,
  ignored boolean default false
);

-- Social captions (generated per article id/slug)
create table if not exists social_captions (
  id bigserial primary key,
  doc_type text not null,
  doc_id text not null,
  x_thread text,
  ig_caption text,
  linkedin text,
  created_at timestamptz default now()
);

-- Newsletter subscribers
create table if not exists newsletter_subs (
  id bigserial primary key,
  email text unique not null,
  source text,
  created_at timestamptz default now()
);

-- Simple analytics
create table if not exists page_events (
  id bigserial primary key,
  path text not null,
  referrer text,
  user_agent text,
  ts timestamptz default now()
);

alter table ai_news_stream enable row level security;
create policy "Allow public read" on ai_news_stream for select using (true);

alter table social_captions enable row level security;
create policy "Allow service upsert" on social_captions for all using (auth.role() = 'service_role');

alter table newsletter_subs enable row level security;
create policy "Allow insert" on newsletter_subs for insert with check (true);
create policy "Allow select" on newsletter_subs for select using (auth.role() = 'service_role');

alter table page_events enable row level security;
create policy "Allow insert" on page_events for insert with check (true);
create policy "Allow select" on page_events for select using (auth.role() = 'service_role');
