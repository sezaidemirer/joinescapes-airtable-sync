-- Airtable yazılarını Join PR'a ata - FINAL FIX

-- 1. Önce Join PR kullanıcısının ID'sini kontrol et
SELECT 
    id as user_id,
    email
FROM auth.users
WHERE email = 'joinprmarketing@gmail.com';

-- 2. Şu anda author_id = NULL olan yazıları göster (güncellenmeden önce)
SELECT 
    'GÜNCELLENMEDİĞİNDE:' as durum,
    id,
    title,
    author_id,
    author_name
FROM posts
WHERE author_id IS NULL
ORDER BY created_at DESC;

-- 3. GÜNCELLEME YAP - Tüm NULL yazıları Join PR'a ata
UPDATE posts
SET 
    author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com' LIMIT 1),
    author_name = 'Join PR',
    updated_at = NOW()
WHERE author_id IS NULL
  AND airtable_record_id IS NOT NULL;

-- 4. Kontrol: Kaç yazı güncellendi?
SELECT 
    'GÜNCELLENDİ:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com');

-- 5. Güncellenen yazıları göster
SELECT 
    'GÜNCEL DURUM:' as durum,
    id,
    title,
    author_id,
    author_name,
    status
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com')
ORDER BY created_at DESC;

-- 6. Hala NULL kalan var mı?
SELECT 
    'HALA NULL KALAN:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id IS NULL;

