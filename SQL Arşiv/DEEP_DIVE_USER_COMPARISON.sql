-- Derinlemesine Kullanıcı Karşılaştırma Analizi
-- AMAÇ: Çalışan eski kullanıcı ile çalışmayan yeni kullanıcı arasındaki farkları tespit etmek.

-- KULLANICI TANIMLARI
-- Çalışan Eski Kullanıcı (Referans)
-- 'demirersezai@gmail.com'

-- Çalışmayan Yeni Kullanıcı (Hedef)
-- 'gulbahar.semra@hotmail.com'

-- ----------------------------------------------------------------
-- BÖLÜM 1: auth.users Tablosu Karşılaştırması
-- Temel kullanıcı bilgilerini ve metadata yapılarını karşılaştırır.
-- ----------------------------------------------------------------
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


-- ----------------------------------------------------------------
-- BÖLÜM 2: writer_profiles Tablosu Karşılaştırması
-- İki kullanıcının yazar profillerinin olup olmadığını ve içeriklerini karşılaştırır.
-- ----------------------------------------------------------------
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


-- ----------------------------------------------------------------
-- BÖLÜM 3: raw_user_meta_data Detaylı Karşılaştırması
-- En kritik bölüm. Metadata içerisindeki tüm anahtar/değer çiftlerini satır satır karşılaştırır.
-- ----------------------------------------------------------------
WITH metadata_comparison AS (
    SELECT
        email,
        jsonb_object_keys(raw_user_meta_data) AS meta_key,
        raw_user_meta_data->>jsonb_object_keys(raw_user_meta_data) AS meta_value
    FROM auth.users
    WHERE email IN ('demirersezai@gmail.com', 'gulbahar.semra@hotmail.com')
)
SELECT 
    'BÖLÜM 3: Metadata Detayları' as section,
    mc.meta_key,
    MAX(CASE WHEN mc.email = 'demirersezai@gmail.com' THEN mc.meta_value ELSE NULL END) AS demirersezai_value,
    MAX(CASE WHEN mc.email = 'gulbahar.semra@hotmail.com' THEN mc.meta_value ELSE NULL END) AS gulbahar_value,
    CASE
        WHEN MAX(CASE WHEN mc.email = 'demirersezai@gmail.com' THEN mc.meta_value ELSE NULL END) IS DISTINCT FROM MAX(CASE WHEN mc.email = 'gulbahar.semra@hotmail.com' THEN mc.meta_value ELSE NULL END)
        THEN '!!! FARK VAR !!!'
        ELSE 'AYNI'
    END as comparison_result
FROM metadata_comparison mc
GROUP BY mc.meta_key
ORDER BY mc.meta_key;

-- ----------------------------------------------------------------
-- BÖLÜM 4: İlgili RLS Politikalarının Kontrolü
-- Her iki kullanıcıya da etki edebilecek RLS politikalarını listeler.
-- ----------------------------------------------------------------
SELECT
    'BÖLÜM 4: RLS Politikaları' as section,
    policyname,
    tablename,
    cmd AS command,
    roles,
    qual AS check_expression
FROM pg_policies
WHERE tablename IN ('writer_profiles', 'posts') AND schemaname = 'public';
