-- Tüm Airtable yazılarını (author_id = NULL) joinprmarketing@gmail.com kullanıcısına ata

-- 1. Kullanıcı ID'sini al
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'joinprmarketing@gmail.com';

-- 2. Kaç Airtable yazısı var?
SELECT 
    COUNT(*) as toplam_airtable_yazisi
FROM posts
WHERE author_id IS NULL;

-- 3. Tüm Airtable yazılarını joinprmarketing@gmail.com'a ata
UPDATE posts
SET 
    author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com'),
    author_name = 'Join PR'
WHERE author_id IS NULL;

-- 4. Kontrol: Güncellenen yazıları göster
SELECT 
    id,
    title,
    author_id,
    author_name,
    status,
    created_at
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com')
ORDER BY created_at DESC;

-- 5. Özet
SELECT 
    '✅ Join PR kullanıcısına atanan yazılar:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com');

-- 6. Şimdi Airtable sekmesinde kalan yazı sayısı (sıfır olmalı)
SELECT 
    'Airtable sekmesinde kalan yazılar (author_id = NULL):' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id IS NULL;

