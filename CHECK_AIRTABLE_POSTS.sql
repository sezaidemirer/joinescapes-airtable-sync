-- Airtable yazılarını kontrol et

-- 1. author_id = NULL olan yazılar (Airtable'dan gelenler)
SELECT 
    id,
    title,
    author_id,
    author_name,
    airtable_record_id,
    status,
    created_at
FROM posts
WHERE author_id IS NULL
ORDER BY created_at DESC;

-- 2. Toplam sayı
SELECT 
    'Toplam Airtable yazısı (author_id = NULL):' as bilgi,
    COUNT(*) as sayi
FROM posts
WHERE author_id IS NULL;

-- 3. Status'e göre dağılım
SELECT 
    status,
    COUNT(*) as sayi
FROM posts
WHERE author_id IS NULL
GROUP BY status;

-- 4. airtable_record_id olan ama author_id NULL olmayan (sorunlu kayıtlar)
SELECT 
    id,
    title,
    author_id,
    author_name,
    airtable_record_id,
    status
FROM posts
WHERE airtable_record_id IS NOT NULL 
  AND author_id IS NOT NULL;

-- 5. Son sync'te güncellenen yazılar (son 10 dakika)
SELECT 
    id,
    title,
    author_id,
    author_name,
    airtable_record_id,
    updated_at
FROM posts
WHERE author_id IS NULL
  AND updated_at > NOW() - INTERVAL '10 minutes'
ORDER BY updated_at DESC;

