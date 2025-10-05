-- NULL author_id'li yazıları Join PR'a ata

-- 1. Join PR kullanıcısının ID'sini al
DO $$
DECLARE
    join_pr_user_id UUID;
    updated_count INTEGER;
BEGIN
    -- Join PR kullanıcısını bul
    SELECT id INTO join_pr_user_id 
    FROM auth.users 
    WHERE email = 'joinprmarketing@gmail.com' 
    LIMIT 1;

    IF join_pr_user_id IS NOT NULL THEN
        -- NULL author_id'li yazıları Join PR'a ata
        UPDATE posts
        SET 
            author_id = join_pr_user_id,
            author_name = 'Join PR',
            updated_at = NOW()
        WHERE author_id IS NULL
          AND airtable_record_id IS NOT NULL;

        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
        RAISE NOTICE '✅ % yazı Join PR''a atandı', updated_count;
    ELSE
        RAISE NOTICE '❌ Join PR kullanıcısı bulunamadı!';
    END IF;
END $$;

-- Kontrol: Kaç yazı Join PR'a ait?
SELECT 
    'Join PR yazıları:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com' LIMIT 1);

-- Kontrol: Hala NULL kalan var mı?
SELECT 
    'Hala NULL kalan:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id IS NULL AND airtable_record_id IS NOT NULL;

-- Son 10 yazıyı kontrol et
SELECT 
    id,
    title,
    author_id,
    author_name,
    airtable_record_id,
    created_at
FROM posts 
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
