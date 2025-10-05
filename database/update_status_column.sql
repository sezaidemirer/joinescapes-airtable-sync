-- Posts tablosundaki status kolonunu güncelle
-- Pending ve rejected durumlarını ekle

-- 1. Önce CHECK constraint'i kaldır
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- 2. Yeni CHECK constraint ekle (pending ve rejected dahil)
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived'));

-- 3. Mevcut published yazıları kontrol et
SELECT status, COUNT(*) as count 
FROM posts 
GROUP BY status;

-- 4. Test için bir pending yazı oluştur (opsiyonel)
-- INSERT INTO posts (title, slug, content, status, author_name, category_id)
-- VALUES ('Test Pending Yazı', 'test-pending-yazi', 'Bu bir test yazısıdır.', 'pending', 'Test Editör', 1);

