-- Posts tablosundaki constraint sorununu düzelt (PostgreSQL 12+ uyumlu)

-- 1. Mevcut constraint'leri kontrol et (yeni syntax)
SELECT conname, pg_get_constraintdef(oid) as definition
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

-- 5. Constraint'in başarıyla eklendiğini doğrula
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass 
AND contype = 'c'
AND conname = 'posts_status_check';
