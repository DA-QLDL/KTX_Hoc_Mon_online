-- KTX v1.0.103 - run in Supabase SQL Editor after reviewing access rules.
-- IMPORTANT: Policies below authorize any authenticated Supabase user. Tighten to your
-- operational roles and allowed KTX scope before using Production.
create table if not exists public.ktx_document_items (
  id text primary key,
  kind text not null check (kind in ('docs','folders')),
  name text not null,
  fid text not null default '',
  note text not null default '',
  size bigint not null default 0,
  type text not null default '',
  path text not null default '',
  at bigint not null default 0
);
create index if not exists ktx_document_items_kind_at_idx on public.ktx_document_items(kind,at desc);
alter table public.ktx_document_items enable row level security;
drop policy if exists ktx_document_auth_select on public.ktx_document_items;
drop policy if exists ktx_document_auth_insert on public.ktx_document_items;
drop policy if exists ktx_document_auth_update on public.ktx_document_items;
drop policy if exists ktx_document_auth_delete on public.ktx_document_items;
create policy ktx_document_auth_select on public.ktx_document_items for select to authenticated using (true);
create policy ktx_document_auth_insert on public.ktx_document_items for insert to authenticated with check (true);
create policy ktx_document_auth_update on public.ktx_document_items for update to authenticated using (true) with check (true);
create policy ktx_document_auth_delete on public.ktx_document_items for delete to authenticated using (true);
insert into storage.buckets (id,name,public,file_size_limit)
values ('ktx-documents','ktx-documents',false,20971520)
on conflict (id) do update set public=false,file_size_limit=20971520;
drop policy if exists ktx_doc_storage_read on storage.objects;
drop policy if exists ktx_doc_storage_write on storage.objects;
drop policy if exists ktx_doc_storage_delete on storage.objects;
create policy ktx_doc_storage_read on storage.objects for select to authenticated using (bucket_id='ktx-documents');
create policy ktx_doc_storage_write on storage.objects for insert to authenticated with check (bucket_id='ktx-documents');
create policy ktx_doc_storage_delete on storage.objects for delete to authenticated using (bucket_id='ktx-documents');
