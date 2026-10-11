-- FFCS Faculty Insights: public directory, private review ownership, and
-- deliberately narrow public read/write functions. Apply as the database owner.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table if not exists public.faculty_directory (
  id text primary key,
  name text not null,
  source text not null default 'FFCS-inator June 2026 archive',
  created_at timestamptz not null default now()
);
create table if not exists public.course_directory (
  code text primary key,
  title text not null,
  course_type text not null,
  created_at timestamptz not null default now()
);
alter table public.faculty_directory enable row level security;
alter table public.course_directory enable row level security;
create policy "Public faculty directory" on public.faculty_directory for select to anon, authenticated using (true);
create policy "Public course directory" on public.course_directory for select to anon, authenticated using (true);
revoke all on public.faculty_directory, public.course_directory from anon, authenticated;
grant select on public.faculty_directory, public.course_directory to anon, authenticated;

create table if not exists app_private.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  faculty_id text not null references public.faculty_directory(id),
  course_code text references public.course_directory(code),
  overall smallint not null check (overall between 1 and 5),
  teaching smallint check (teaching between 1 and 5),
  grading smallint check (grading between 1 and 5),
  workload smallint check (workload between 1 and 5),
  lab_ease smallint check (lab_ease between 1 and 5),
  would_take_again boolean,
  comment text check (comment is null or char_length(comment) between 20 and 800),
  -- Self-attestation is not enrollment verification.
  studied_under_faculty boolean not null check (studied_under_faculty),
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (author_id, faculty_id)
);
create index if not exists reviews_public_lookup on app_private.reviews (faculty_id, published_at desc) where status = 'published';
create index if not exists reviews_moderation_queue on app_private.reviews (status, updated_at desc);
create index if not exists reviews_author_lookup on app_private.reviews (author_id, updated_at desc);
alter table app_private.reviews enable row level security;
revoke all on app_private.reviews from public, anon, authenticated;

create table if not exists app_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table app_private.admins enable row level security;
revoke all on app_private.admins from public, anon, authenticated;

create table if not exists app_private.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references app_private.reviews(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'private_info', 'other')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (review_id, reporter_id)
);
create index if not exists review_reports_review_lookup on app_private.review_reports (review_id);
alter table app_private.review_reports enable row level security;
revoke all on app_private.review_reports from public, anon, authenticated;

create table if not exists app_private.moderation_actions (
  id bigint generated always as identity primary key,
  review_id uuid not null references app_private.reviews(id) on delete cascade,
  admin_id uuid not null references auth.users(id),
  action text not null check (action in ('publish', 'hide', 'reopen')),
  created_at timestamptz not null default now()
);
alter table app_private.moderation_actions enable row level security;
revoke all on app_private.moderation_actions from public, anon, authenticated;

create or replace function app_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from app_private.admins where user_id = (select auth.uid()));
$$;
revoke all on function app_private.is_admin() from public, anon, authenticated;

-- The authenticated caller can create or replace only their own faculty review.
-- All new/edited reviews wait for moderation before public display or aggregation.
create or replace function public.save_review(
  p_faculty_id text, p_overall smallint, p_teaching smallint default null,
  p_grading smallint default null, p_workload smallint default null,
  p_lab_ease smallint default null, p_would_take_again boolean default null,
  p_course_code text default null, p_comment text default null,
  p_studied_under_faculty boolean default false
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
  v_comment text := nullif(btrim(p_comment), '');
  v_course text := nullif(btrim(p_course_code), '');
begin
  if v_user is null then raise exception 'Sign in before reviewing.' using errcode = '28000'; end if;
  if not p_studied_under_faculty then raise exception 'Only review faculty you studied under.' using errcode = '22023'; end if;
  if p_overall is null or p_overall not between 1 and 5 or
     (p_teaching is not null and p_teaching not between 1 and 5) or
     (p_grading is not null and p_grading not between 1 and 5) or
     (p_workload is not null and p_workload not between 1 and 5) or
     (p_lab_ease is not null and p_lab_ease not between 1 and 5) then
    raise exception 'Ratings must be between 1 and 5.' using errcode = '22023';
  end if;
  if v_comment is not null and char_length(v_comment) not between 20 and 800 then
    raise exception 'Written reviews must be 20 to 800 characters.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.faculty_directory where id = p_faculty_id) then
    raise exception 'Faculty not found.' using errcode = '22023';
  end if;
  if v_course is not null and not exists (select 1 from public.course_directory where code = v_course) then
    raise exception 'Course not found.' using errcode = '22023';
  end if;
  if exists (select 1 from app_private.reviews where author_id = v_user and updated_at > now() - interval '45 seconds') then
    raise exception 'Please wait a moment before submitting another review.' using errcode = '22023';
  end if;
  insert into app_private.reviews (
    author_id, faculty_id, course_code, overall, teaching, grading, workload,
    lab_ease, would_take_again, comment, studied_under_faculty
  ) values (
    v_user, p_faculty_id, v_course, p_overall, p_teaching, p_grading, p_workload,
    p_lab_ease, p_would_take_again, v_comment, true
  ) on conflict (author_id, faculty_id) do update set
    course_code = excluded.course_code, overall = excluded.overall,
    teaching = excluded.teaching, grading = excluded.grading,
    workload = excluded.workload, lab_ease = excluded.lab_ease,
    would_take_again = excluded.would_take_again, comment = excluded.comment,
    status = 'pending', published_at = null, updated_at = now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.save_review(text,smallint,smallint,smallint,smallint,smallint,boolean,text,text,boolean) from public, anon;
grant execute on function public.save_review(text,smallint,smallint,smallint,smallint,smallint,boolean,text,text,boolean) to authenticated;

create or replace function public.my_review(p_faculty_id text)
returns table (id uuid, course_code text, overall smallint, teaching smallint, grading smallint,
  workload smallint, lab_ease smallint, would_take_again boolean, comment text, status text)
language sql stable security definer set search_path = '' as $$
  select r.id, r.course_code, r.overall, r.teaching, r.grading, r.workload,
    r.lab_ease, r.would_take_again, r.comment, r.status
  from app_private.reviews r
  where r.author_id = (select auth.uid()) and r.faculty_id = p_faculty_id limit 1;
$$;
revoke all on function public.my_review(text) from public, anon;
grant execute on function public.my_review(text) to authenticated;

create or replace function public.delete_my_review(p_faculty_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Sign in first.' using errcode = '28000'; end if;
  delete from app_private.reviews where author_id = (select auth.uid()) and faculty_id = p_faculty_id;
end;
$$;
revoke all on function public.delete_my_review(text) from public, anon;
grant execute on function public.delete_my_review(text) to authenticated;

-- Public functions return only approved content and never an author identifier.
create or replace function public.published_reviews_for(p_faculty_id text, p_limit integer default 20)
returns table (id uuid, faculty_id text, course_code text, overall smallint, teaching smallint,
  grading smallint, workload smallint, lab_ease smallint, would_take_again boolean,
  comment text, published_on date)
language sql stable security definer set search_path = '' as $$
  select r.id, r.faculty_id, r.course_code, r.overall, r.teaching, r.grading,
    r.workload, r.lab_ease, r.would_take_again, r.comment, r.published_at::date
  from app_private.reviews r where r.faculty_id = p_faculty_id and r.status = 'published'
  order by r.published_at desc limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;
revoke all on function public.published_reviews_for(text,integer) from public;
grant execute on function public.published_reviews_for(text,integer) to anon, authenticated;

create or replace function public.review_summaries()
returns table (faculty_id text, review_count bigint, overall numeric, teaching numeric,
  teaching_count bigint, grading numeric, grading_count bigint, workload numeric,
  workload_count bigint, lab_ease numeric, lab_ease_count bigint, again_percent numeric,
  again_count bigint)
language sql stable security definer set search_path = '' as $$
  select r.faculty_id, count(*), round(avg(r.overall), 2), round(avg(r.teaching), 2),
    count(r.teaching), round(avg(r.grading), 2), count(r.grading),
    round(avg(r.workload), 2), count(r.workload), round(avg(r.lab_ease), 2),
    count(r.lab_ease), round(100.0 * count(*) filter (where r.would_take_again = true)
      / nullif(count(r.would_take_again), 0), 0), count(r.would_take_again)
  from app_private.reviews r where r.status = 'published' group by r.faculty_id;
$$;
revoke all on function public.review_summaries() from public;
grant execute on function public.review_summaries() to anon, authenticated;

create or replace function public.report_review(p_review_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Sign in to report.' using errcode = '28000'; end if;
  if p_reason not in ('spam', 'harassment', 'private_info', 'other') then
    raise exception 'Choose a report reason.' using errcode = '22023';
  end if;
  if not exists (select 1 from app_private.reviews where id = p_review_id and status = 'published') then
    raise exception 'Review unavailable.' using errcode = '22023';
  end if;
  if exists (select 1 from app_private.reviews where id = p_review_id and author_id = (select auth.uid())) then
    raise exception 'You cannot report your own review.' using errcode = '22023';
  end if;
  insert into app_private.review_reports (review_id, reporter_id, reason)
  values (p_review_id, (select auth.uid()), p_reason)
  on conflict (review_id, reporter_id) do update set
    reason = excluded.reason, created_at = now(), resolved_at = null;
end;
$$;
revoke all on function public.report_review(uuid,text) from public, anon;
grant execute on function public.report_review(uuid,text) to authenticated;

create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not app_private.is_admin() then raise exception 'Forbidden.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'reviews', (select count(*) from app_private.reviews),
    'pending', (select count(*) from app_private.reviews where status = 'pending'),
    'published', (select count(*) from app_private.reviews where status = 'published'),
    'last24h', (select count(*) from app_private.reviews where created_at > now() - interval '24 hours'),
    'reports', (select count(*) from app_private.review_reports rr join app_private.reviews r on r.id = rr.review_id where r.status = 'published' and rr.resolved_at is null),
    'faculty_without_reviews', (select count(*) from public.faculty_directory f where not exists
      (select 1 from app_private.reviews r where r.faculty_id = f.id and r.status = 'published'))
  );
end;
$$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

create or replace function public.admin_coverage()
returns table (faculty_id text, faculty_name text, review_count bigint, written_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not app_private.is_admin() then raise exception 'Forbidden.' using errcode = '42501'; end if;
  return query select f.id, f.name,
    count(r.id), count(r.id) filter (where r.comment is not null)
  from public.faculty_directory f
  left join app_private.reviews r on r.faculty_id = f.id and r.status = 'published'
  group by f.id, f.name
  order by count(r.id), f.name;
end;
$$;
revoke all on function public.admin_coverage() from public, anon;
grant execute on function public.admin_coverage() to authenticated;

create or replace function public.admin_review_queue()
returns table (id uuid, faculty_id text, faculty_name text, overall smallint, comment text,
  status text, updated_at timestamptz, report_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not app_private.is_admin() then raise exception 'Forbidden.' using errcode = '42501'; end if;
  return query select r.id, r.faculty_id, f.name, r.overall, r.comment, r.status,
    r.updated_at, (select count(*) from app_private.review_reports rr where rr.review_id = r.id and rr.resolved_at is null)
  from app_private.reviews r join public.faculty_directory f on f.id = r.faculty_id
  where r.status = 'pending' or exists
    (select 1 from app_private.review_reports rr where rr.review_id = r.id and rr.resolved_at is null)
  order by r.updated_at desc limit 100;
end;
$$;
revoke all on function public.admin_review_queue() from public, anon;
grant execute on function public.admin_review_queue() to authenticated;

create or replace function public.admin_moderate(p_review_id uuid, p_action text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not app_private.is_admin() then raise exception 'Forbidden.' using errcode = '42501'; end if;
  if p_action not in ('publish', 'hide', 'reopen') then
    raise exception 'Invalid action.' using errcode = '22023';
  end if;
  update app_private.reviews set
    status = case p_action when 'publish' then 'published' when 'hide' then 'hidden' else 'pending' end,
    published_at = case when p_action = 'publish' then now() else null end,
    updated_at = now()
  where id = p_review_id;
  if not found then raise exception 'Review not found.' using errcode = '22023'; end if;
  insert into app_private.moderation_actions(review_id, admin_id, action)
  values (p_review_id, (select auth.uid()), p_action);
  update app_private.review_reports set resolved_at = now()
  where review_id = p_review_id and resolved_at is null;
end;
$$;
revoke all on function public.admin_moderate(uuid,text) from public, anon;
grant execute on function public.admin_moderate(uuid,text) to authenticated;

-- Curated Reddit references are links only. They are never counted as student reviews.
create table if not exists app_private.discussion_links (
  id uuid primary key default gen_random_uuid(),
  faculty_id text not null references public.faculty_directory(id),
  url text not null unique,
  added_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table app_private.discussion_links enable row level security;
revoke all on app_private.discussion_links from public, anon, authenticated;

create or replace function public.discussion_links_for(p_faculty_id text)
returns table (url text, added_on date)
language sql stable security definer set search_path = '' as $$
  select d.url, d.created_at::date from app_private.discussion_links d
  where d.faculty_id = p_faculty_id order by d.created_at desc limit 20;
$$;
revoke all on function public.discussion_links_for(text) from public;
grant execute on function public.discussion_links_for(text) to anon, authenticated;

create or replace function public.admin_add_discussion(p_faculty_id text, p_url text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not app_private.is_admin() then raise exception 'Forbidden.' using errcode = '42501'; end if;
  if p_url !~ '^https://(www\.)?reddit\.com/r/[A-Za-z0-9_]+/comments/[A-Za-z0-9]+(/|[?#]|$)' then
    raise exception 'Use a direct Reddit discussion link.' using errcode = '22023';
  end if;
  insert into app_private.discussion_links(faculty_id, url, added_by)
  values (p_faculty_id, p_url, (select auth.uid())) on conflict (url) do nothing;
end;
$$;
revoke all on function public.admin_add_discussion(text,text) from public, anon;
grant execute on function public.admin_add_discussion(text,text) to authenticated;
