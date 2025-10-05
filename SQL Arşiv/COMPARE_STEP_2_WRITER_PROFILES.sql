-- Karşılaştırma Adım 2: writer_profiles Tablosu
-- İki kullanıcının yazar profillerinin olup olmadığını ve içeriklerini karşılaştırır.
SELECT
    'BÖLÜM 2: writer_profiles' as section,
    CASE
        WHEN u.email = 'demirersezai@gmail.com' THEN 'ÇALIŞAN ESKİ KULLANICI'
        ELSE 'ÇALIŞMAYAN YENİ KULLANICI'
    END as user_type,
    u.email,
    wp.*
FROM auth.users u
LEFT JOIN writer_profiles wp ON u.id = wp.user_id
WHERE u.email IN ('demirersezai@gmail.com', 'gulbahar.semra@hotmail.com')
ORDER BY user_type DESC;
