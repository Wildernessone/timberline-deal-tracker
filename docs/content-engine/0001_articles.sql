-- Content engine: editorial articles (buying guides, sale trackers, gear explainers).
-- DB-driven like portal_brands so a new article goes live with NO code deploy.
-- Apply to the hub Supabase project (jcmkoooivghwrgezxode).

create table if not exists public.articles (
  id           bigint generated always as identity primary key,
  portal       text not null,                          -- timberline | whitetail | waterfowl | turkey
  slug         text not null,
  title        text not null,
  dek          text,                                   -- subtitle / meta description / hero blurb
  body_md      text not null,                          -- markdown (rendered by lib/markdown.js)
  hero_image   text,
  tags         text[] not null default '{}',
  keyword      text,                                   -- target search query
  status       text not null default 'draft',          -- draft | published | archived
  author       text not null default 'Editorial',
  model        text,                                   -- model that generated it (provenance)
  quality_note text,                                   -- generator's self-assessment / editor pass note
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  unique (portal, slug)
);

create index if not exists articles_portal_status_pub_idx
  on public.articles (portal, status, published_at desc);

alter table public.articles enable row level security;

-- Public site reads ONLY published rows (anon). Drafts are invisible to visitors.
drop policy if exists "anon read published articles" on public.articles;
create policy "anon read published articles"
  on public.articles for select to anon
  using (status = 'published');

-- Writes are service-key only (the droplet generator) — bypasses RLS, so no
-- insert/update policy is granted to anon/authenticated.

-- Admin approval RPC: flip draft -> published (or archive/unpublish). SECURITY
-- DEFINER + JWT-email gate, same admin model as the rest of the stack. Called by
-- Command Center's authed admin session.
create or replace function public.set_article_status(p_id bigint, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'jamesreed@tutamail.com' then
    raise exception 'not authorized';
  end if;
  if p_status not in ('draft','published','archived') then
    raise exception 'bad status %', p_status;
  end if;
  update public.articles
     set status = p_status,
         published_at = case when p_status = 'published' then coalesce(published_at, now()) else published_at end,
         updated_at = now()
   where id = p_id;
end;
$$;

revoke all on function public.set_article_status(bigint, text) from public;
grant execute on function public.set_article_status(bigint, text) to authenticated;

-- Admin read RPC: drafts for the approval queue (Command Center). Returns all
-- statuses; gated to admin.
create or replace function public.admin_articles()
returns setof public.articles
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'jamesreed@tutamail.com' then
    raise exception 'not authorized';
  end if;
  return query select * from public.articles order by created_at desc;
end;
$$;

revoke all on function public.admin_articles() from public;
grant execute on function public.admin_articles() to authenticated;
