-- users tablosunu kontrol et

-- 1. users tablosunda Join PR var mı?
SELECT 
    id::text as user_id,
    email,
    name
FROM users
WHERE email = 'joinprmarketing@gmail.com';

-- 2. users tablosunda kaç kullanıcı var?
SELECT COUNT(*) as toplam_users FROM users;

-- 3. auth.users'da kaç kullanıcı var?
SELECT COUNT(*) as toplam_auth_users FROM auth.users;

-- 4. Tüm users tablosundaki kullanıcıları göster
SELECT 
    id::text as user_id,
    email,
    name
FROM users
ORDER BY created_at DESC;

-- 5. posts tablosunun foreign key'ini kontrol et
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='posts'
  AND kcu.column_name='author_id';

