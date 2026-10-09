-- Для структуры authors/posts из предыдущей версии.
-- Сначала сделайте резервную копию. Выполните целиком в SQL Editor.
begin;
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_path text
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id),
  title text not null,
  body text not null,
  category text not null,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
alter table public.authors add column if not exists bio text;
alter table public.authors add column if not exists avatar_path text;
alter table public.authors add column if not exists quote text;
alter table public.authors add column if not exists instagram_url text;
alter table public.authors add column if not exists tiktok_url text;
alter table public.authors add column if not exists telegram_url text;
alter table public.posts add column if not exists original_author text;
alter table public.posts add column if not exists original_language text;
-- Заменяется только ограничение категории нашей предыдущей версии.
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('poem','translation','news','culture','language','idea'));
create index if not exists posts_author_idx on public.posts(author_id);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists comments_post_status_idx on public.comments(post_id,status,created_at);
alter table public.authors enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
revoke all on public.authors, public.posts, public.comments from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.authors, public.posts, public.comments to anon, authenticated;
-- Статус и время комментария посетитель не может задавать.
grant insert (post_id,display_name,body) on public.comments to anon, authenticated;
drop policy if exists "Read published authors" on public.authors;
drop policy if exists "Read public authors" on public.authors;
create policy "Read public authors" on public.authors for select to anon, authenticated using (true);
drop policy if exists "Read published posts" on public.posts;
create policy "Read published posts" on public.posts for select to anon, authenticated using (status='published');
drop policy if exists "Read published comments" on public.comments;
create policy "Read published comments" on public.comments for select to anon, authenticated
using (status='published' and exists (
  select 1 from public.posts p where p.id=comments.post_id and p.status='published' and p.category in ('poem','translation')
));
drop policy if exists "Submit pending comments" on public.comments;
create policy "Submit pending comments" on public.comments for insert to anon, authenticated
with check (status='pending' and exists (
  select 1 from public.posts p where p.id=comments.post_id and p.status='published' and p.category in ('poem','translation')
));
commit;
NOTIFY pgrst, 'reload schema';
