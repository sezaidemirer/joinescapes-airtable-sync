-- posts.author_id foreign key'ini kontrol et

-- 1. Foreign key constraint'ini bul
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'posts'
  AND kcu.column_name = 'author_id';

-- 2. posts tablosunun yapısını göster
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('author_id', 'author_name')
ORDER BY ordinal_position;

-- 3. users tablosu var mı kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'auth.users');

