-- Run once in a NEW project. Never put a service-role key in the website.
create table public.staff_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','manager'))
);
alter table public.staff_roles enable row level security;
revoke all on public.staff_roles from anon, authenticated;
grant select on public.staff_roles to authenticated;
create policy "Staff reads own role" on public.staff_roles for select to authenticated using (user_id=auth.uid());
create function public.staff_role() returns text language sql stable security definer set search_path='' as $$
 select role from public.staff_roles where user_id=(select auth.uid())
$$;
revoke all on function public.staff_role() from public;
grant execute on function public.staff_role() to authenticated;

create table public.product_categories (
 id text primary key default gen_random_uuid()::text,
 name jsonb not null check (coalesce(jsonb_typeof(name)='object' and jsonb_typeof(name->'fr')='string' and jsonb_typeof(name->'ar')='string' and length(trim(name->>'fr')) between 1 and 160 and length(trim(name->>'ar')) between 1 and 160,false)),
 created_at timestamptz not null default now()
);
create table public.products (
 id text primary key default gen_random_uuid()::text,
 category_id text not null references public.product_categories(id),
 name jsonb not null check (coalesce(jsonb_typeof(name)='object' and jsonb_typeof(name->'fr')='string' and jsonb_typeof(name->'ar')='string' and length(trim(name->>'fr')) between 1 and 160 and length(trim(name->>'ar')) between 1 and 160,false)),
 description jsonb,
 price numeric(10,2) not null check (price>=0),
 image text not null check (image ~ '^https://'),
 status text not null default 'draft' check (status in ('draft','published')),
 created_at timestamptz not null default now()
);
create table public.social_links (
 id text primary key default gen_random_uuid()::text,
 platform text not null check (platform in ('instagram','tiktok','whatsapp')),
 url text not null,
 created_at timestamptz not null default now(),
 check ((platform='instagram' and url ~ '^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$') or
 (platform='tiktok' and url ~ '^https://(www\.)?tiktok\.com/@[A-Za-z0-9_.]+/?$') or
 (platform='whatsapp' and url ~ '^https://wa\.me/[1-9][0-9]{7,14}/?$'))
);
create table public.service_groups (
 id text primary key,
 fr text not null,
 ar text not null,
 items jsonb not null check (jsonb_typeof(items)='array'),
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.social_links enable row level security;
alter table public.service_groups enable row level security;
revoke all on public.products, public.product_categories, public.social_links, public.service_groups from anon, authenticated;
grant select on public.products, public.product_categories, public.social_links, public.service_groups to anon, authenticated;
grant insert,update,delete on public.products, public.product_categories, public.social_links, public.service_groups to authenticated;
create policy "Public published products" on public.products for select to anon,authenticated using(status='published');
create policy "Staff manages products" on public.products for all to authenticated using((select public.staff_role()) in ('admin','manager')) with check((select public.staff_role()) in ('admin','manager'));
create policy "Public categories" on public.product_categories for select to anon,authenticated using(true);
create policy "Staff manages categories" on public.product_categories for all to authenticated using((select public.staff_role()) in ('admin','manager')) with check((select public.staff_role()) in ('admin','manager'));
create policy "Public services" on public.service_groups for select to anon,authenticated using(true);
create policy "Staff manages services" on public.service_groups for all to authenticated using((select public.staff_role()) in ('admin','manager')) with check((select public.staff_role()) in ('admin','manager'));
create policy "Public contacts" on public.social_links for select to anon,authenticated using(true);
create policy "Admin manages contacts" on public.social_links for all to authenticated using((select public.staff_role())='admin') with check((select public.staff_role())='admin');
insert into public.product_categories(id,name) values
 ('cosmetiques','{"fr":"Cosmétiques","ar":"مستحضرات التجميل"}'),
 ('cheveux','{"fr":"Soins capillaires","ar":"العناية بالشعر"}'),
 ('brosses','{"fr":"Brosses & accessoires","ar":"الفرش والإكسسوارات"}'),
 ('appareils','{"fr":"Sèche-cheveux & appareils","ar":"مجففات وأجهزة الشعر"}');
insert into public.social_links(platform,url) values
 ('instagram','https://www.instagram.com/ohh_zaz/'),
 ('tiktok','https://www.tiktok.com/@sihamelhallaoui'),
 ('whatsapp','https://wa.me/212775355346');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('catalogue','catalogue',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy "Staff uploads catalogue images" on storage.objects for insert to authenticated with check(bucket_id='catalogue' and (select public.staff_role()) in ('admin','manager'));
-- Accounts are invited in Auth by the owner. Assign roles in SQL, never through public signup:
-- insert into public.staff_roles(user_id,role) values ('AUTH-USER-UUID','admin');
-- Repeat for manager with role 'manager'. Disable public signup in Auth settings.
-- Storage objects are immutable through this UI; no public deletion/overwrite policy.
