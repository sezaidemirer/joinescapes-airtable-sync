-- Semra Gülbahar profil sorununu tespit et ve düzelt

-- 1. Semra'nın writer_profiles'daki verilerini kontrol et (özellikle JSON alanlar)
SELECT 
    id,
    name,
    title,
    bio,
    specialties::text as specialties_raw,
    social_media::text as social_media_raw,
    profile_image,
    user_id,
    created_at
FROM writer_profiles
WHERE 
    name ILIKE '%semra%' 
    OR name ILIKE '%gülbahar%'
    OR name ILIKE '%gulbahar%';

-- 2. Semra'nın posts'taki author_name'ini kontrol et
SELECT DISTINCT author_name
FROM posts
WHERE 
    author_name ILIKE '%semra%' 
    OR author_name ILIKE '%gülbahar%'
    OR author_name ILIKE '%gulbahar%';

-- 3. OLASI SORUN: specialties veya social_media JSON formatı bozuk olabilir
-- Bu satır Semra'nın profilindeki olası bozuk JSON'ları düzeltecek:

UPDATE writer_profiles
SET 
    specialties = CASE 
        WHEN specialties IS NULL OR specialties::text = 'null' THEN ARRAY[]::text[]
        ELSE specialties
    END,
    social_media = CASE 
        WHEN social_media IS NULL OR social_media::text = 'null' THEN '{}'::jsonb
        WHEN social_media::text = '' THEN '{}'::jsonb
        ELSE social_media
    END
WHERE 
    name ILIKE '%semra%' 
    OR name ILIKE '%gülbahar%'
    OR name ILIKE '%gulbahar%';

-- 4. Güncellemeden sonra tekrar kontrol et
SELECT 
    id,
    name,
    title,
    specialties::text as specialties_raw,
    social_media::text as social_media_raw
FROM writer_profiles
WHERE 
    name ILIKE '%semra%' 
    OR name ILIKE '%gülbahar%'
    OR name ILIKE '%gulbahar%';

-- 5. Eğer profil yoksa, oluştur (author_name'den)
-- Bu kısım eğer profil hiç yoksa çalışır
DO $$
DECLARE
    author_name_from_posts TEXT;
    profile_exists BOOLEAN;
BEGIN
    -- Posts tablosundan Semra'nın ismini al
    SELECT DISTINCT posts.author_name INTO author_name_from_posts
    FROM posts
    WHERE 
        author_name ILIKE '%semra%' 
        OR author_name ILIKE '%gülbahar%'
        OR author_name ILIKE '%gulbahar%'
    LIMIT 1;
    
    -- Profil var mı kontrol et
    SELECT EXISTS (
        SELECT 1 FROM writer_profiles 
        WHERE name = author_name_from_posts
    ) INTO profile_exists;
    
    -- Eğer profil yoksa ve posts'ta isim varsa, profil oluştur
    IF NOT profile_exists AND author_name_from_posts IS NOT NULL THEN
        INSERT INTO writer_profiles (
            name,
            title,
            bio,
            specialties,
            social_media
        ) VALUES (
            author_name_from_posts,
            'Editör',
            'Deneyimli editör ve yazar.',
            ARRAY[]::text[],
            '{}'::jsonb
        );
        
        RAISE NOTICE 'Semra için profil oluşturuldu: %', author_name_from_posts;
    END IF;
END $$;

-- 6. Son kontrol
SELECT 
    id,
    name,
    title,
    bio
FROM writer_profiles
WHERE 
    name ILIKE '%semra%' 
    OR name ILIKE '%gülbahar%'
    OR name ILIKE '%gulbahar%';

