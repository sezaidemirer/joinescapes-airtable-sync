-- Beste Akkor kullanıcısını tamamen sil
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce posts tablosundan yazıları sil
DELETE FROM posts WHERE author_name ILIKE '%beste%' OR author_name ILIKE '%akkor%';

-- 2. writer_profiles tablosundan profili sil
DELETE FROM writer_profiles WHERE name ILIKE '%beste%' OR name ILIKE '%akkor%';

-- 3. Auth users tablosundan kullanıcıyı sil (bu manuel olarak Supabase dashboard'dan yapılmalı)
-- Ama önce user_id'yi bulalım:
SELECT id, email FROM auth.users WHERE email = 'beste@beste.com';

-- 4. Eğer başka tablolarda da veri varsa onları da sil
-- (Gerekirse bu kısmı genişletebiliriz)

-- 5. Sonuçları kontrol et
SELECT 'Posts remaining:' as table_name, COUNT(*) as count FROM posts WHERE author_name ILIKE '%beste%'
UNION ALL
SELECT 'Writer profiles remaining:' as table_name, COUNT(*) as count FROM writer_profiles WHERE name ILIKE '%beste%';


