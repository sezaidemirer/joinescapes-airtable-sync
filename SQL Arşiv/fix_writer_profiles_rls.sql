-- Writer_profiles tablosu için RLS policy'lerini düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut policy'leri kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'writer_profiles';

-- 2. Eğer policy varsa sil
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;

-- 3. Public okuma için yeni policy oluştur
CREATE POLICY "writer_profiles_public_read" ON writer_profiles
    FOR SELECT 
    USING (true);

-- 4. Policy'lerin çalıştığını kontrol et
SELECT * FROM writer_profiles WHERE name = 'Beste Akkor';
