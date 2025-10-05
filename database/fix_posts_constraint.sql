"-- Posts tablosundaki constraint sorununu düzelt

-- 1. Mevcut constraint'leri kontrol et
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass 
AND contype = 'c';

-- 2. Eski constraint'i kaldır
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- 3. Yeni constraint'i ekle
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived'));

-- 4. Test için mevcut statusları kontrol et
SELECT DISTINCT status FROM posts;

-- 5. Constraint'in doğru çalıştığını test et
-- INSERT INTO posts (title, slug, content, status, author_name, category_id)
-- VALUES ('Test Pending', 'test-pending', 'Test content', 'pending', 'Test User', 1);
"