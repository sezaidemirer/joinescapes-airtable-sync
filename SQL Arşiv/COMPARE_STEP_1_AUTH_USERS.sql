-- Karşılaştırma Adım 1: auth.users Tablosu
-- Temel kullanıcı bilgilerini ve metadata yapılarını karşılaştırır.
SELECT
    'BÖLÜM 1: auth.users' as section,
    CASE
        WHEN email = 'demirersezai@gmail.com' THEN 'ÇALIŞAN ESKİ KULLANICI'
        ELSE 'ÇALIŞMAYAN YENİ KULLANICI'
    END as user_type,
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    role,
    raw_user_meta_data
FROM auth.users
WHERE email IN ('demirersezai@gmail.com', 'gulbahar.semra@hotmail.com')
ORDER BY user_type DESC;
