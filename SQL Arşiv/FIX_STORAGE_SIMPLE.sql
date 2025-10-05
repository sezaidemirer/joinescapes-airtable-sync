-- ============================================
-- STORAGE RLS POLİCY'LERİNİ DÜZELTMENİN BASİT YOLU
-- ============================================

-- 1. Eski policy'leri kaldır (eğer varsa hata vermeyecek şekilde)
DROP POLICY IF EXISTS "Anyone can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_upload_blog_images" ON storage.objects;
DROP POLICY IF EXISTS "everyone_can_read_blog_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_update_blog_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_delete_blog_images" ON storage.objects;

-- 2. Yeni policy'ler oluştur
CREATE POLICY "Allow authenticated uploads to blog-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow public to read blog-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- ✅ TAMAMLANDI!
SELECT 'Storage policies başarıyla güncellendi!' as sonuc;

