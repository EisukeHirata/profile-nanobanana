-- Create a new storage bucket for generated images
insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do nothing;

-- Allow public access to the bucket (READ)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'generated-images' );

-- Allow authenticated users to upload images (INSERT)
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'generated-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete their own images (DELETE)
-- Note: This requires storing user_id in metadata or path structure, 
-- but for now we'll allow authenticated users to manage the bucket for simplicity in this context
create policy "Authenticated users can delete"
  on storage.objects for delete
  using ( bucket_id = 'generated-images' and auth.role() = 'authenticated' );
