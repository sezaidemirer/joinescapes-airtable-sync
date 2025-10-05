-- Airtable Record ID kolonu ekle
-- Bu kolonda Airtable'daki kaydın ID'si saklanacak
-- Böylece Supabase'de yapılan değişiklikleri Airtable'a geri yazabileceğiz

-- 1. Kolonu ekle (eğer yoksa)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;

-- 2. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_posts_airtable_record_id 
ON posts(airtable_record_id);

-- 3. Kontrol: Airtable yazılarını göster
SELECT 
    id,
    title,
    author_id,
    author_name,
    airtable_record_id,
    created_at
FROM posts
WHERE author_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Bilgi
SELECT 
    '✅ airtable_record_id kolonu eklendi!' as durum,
    COUNT(*) as toplam_airtable_yazisi
FROM posts
WHERE author_id IS NULL;

