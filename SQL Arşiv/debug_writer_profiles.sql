-- Writer_profiles tablosunu debug et
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Tabloyu tamamen kontrol et
SELECT 'writer_profiles tablosu içeriği:' as info;
SELECT * FROM writer_profiles;

-- 2. Tablo var mı kontrol et
SELECT 'Tablo var mı kontrol:' as info;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'writer_profiles'
) as table_exists;

-- 3. Tablo şemasını kontrol et
SELECT 'Tablo şeması:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'writer_profiles'
ORDER BY ordinal_position;

-- 4. RLS aktif mi kontrol et
SELECT 'RLS durumu:' as info;
SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE relname = 'writer_profiles';

-- 5. Policy'leri kontrol et
SELECT 'Policyler:' as info;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'writer_profiles';

-- 6. Manuel veri ekle (test için)
INSERT INTO writer_profiles (name, title, bio, is_featured)
VALUES ('Test Yazar', 'Test Unvan', 'Test Bio', true)
ON CONFLICT DO NOTHING;

-- 7. Tekrar kontrol et
SELECT 'Manuel ekleme sonrası:' as info;
SELECT * FROM writer_profiles;
