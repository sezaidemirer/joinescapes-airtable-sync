-- Admin panelinde yazarlar için RLS policy düzeltmesi
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut writer_profiles policy'lerini kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'writer_profiles';

-- 2. Eski policy'leri sil
DROP POLICY IF EXISTS "writer_profiles_public_read" ON writer_profiles;

-- 3. Yeni policy oluştur - herkes okuyabilir
CREATE POLICY "writer_profiles_public_select" ON writer_profiles
    FOR SELECT 
    USING (true);

-- 4. Admin kullanıcılar güncelleyebilir
CREATE POLICY "writer_profiles_admin_update" ON writer_profiles
    FOR UPDATE 
    TO authenticated
    USING (true);

-- 5. Test sorgusu - tüm yazarları listele
SELECT id, name, title, is_featured, created_at
FROM writer_profiles
ORDER BY created_at DESC;

-- 6. Öne çıkan yazarları listele
SELECT id, name, title, is_featured
FROM writer_profiles
WHERE is_featured = true;

-- 7. Eğer hiç öne çıkan yazar yoksa, mevcut yazarları öne çıkan yap
UPDATE writer_profiles 
SET is_featured = true
WHERE is_featured IS NULL OR is_featured = false;

-- 8. Sonuçları kontrol et
SELECT COUNT(*) as total_writers, 
       COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_writers
FROM writer_profiles;
