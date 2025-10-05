-- GEÇİCİ: Posts tablosu için RLS'i devre dışı bırak
-- UYARI: Bu sadece test içindir! Production'da ASLA kullanma!

-- 1. Mevcut tüm politikaları göster
SELECT 
    policyname, 
    cmd, 
    qual::text as condition
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- 2. RLS'i geçici olarak kapat (SADECE TEST İÇİN!)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 3. RLS durumunu kontrol et
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'posts';

-- NOT: Test bitince RLS'i tekrar aç:
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

