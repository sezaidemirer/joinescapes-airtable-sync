-- Join PR kullanıcısını kontrol et
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_role' as user_role,
    created_at
FROM auth.users 
WHERE email = 'joinprmarketing@gmail.com';

-- NULL author_id'li yazıları kontrol et
SELECT 
    COUNT(*) as null_author_count,
    author_name,
    COUNT(*) as count_by_name
FROM posts 
WHERE author_id IS NULL 
GROUP BY author_name
ORDER BY count_by_name DESC;

-- Son eklenen yazıları kontrol et
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
