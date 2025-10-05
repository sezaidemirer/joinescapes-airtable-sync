-- ============================================
-- STORAGE RLS POLİCY'LERİNİ TAMAMEN SIFIRLA
-- ============================================

-- 1. Mevcut tüm storage.objects policy'lerini kaldır
DROP POLICY IF EXISTS "Anyone can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- 2. RLS'yi etkinleştir
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;

-- 3. YENİ POLİCY'LER: Authenticated kullanıcılar blog-images bucket'ına upload/read yapabilir

-- Upload policy (INSERT)
CREATE POLICY "authenticated_users_can_upload_blog_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Read policy (SELECT)
CREATE POLICY "everyone_can_read_blog_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Update policy (UPDATE)
CREATE POLICY "authenticated_users_can_update_blog_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- Delete policy (DELETE)
CREATE POLICY "authenticated_users_can_delete_blog_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- 4. blog-images bucket'ının public olduğundan emin ol
UPDATE storage.buckets
SET public = true
WHERE id = 'blog-images';

-- ✅ TAMAMLANDI!
SELECT 'Storage RLS policies başarıyla güncellendi!' as sonuc;

