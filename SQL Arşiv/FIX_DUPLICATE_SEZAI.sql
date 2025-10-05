-- Duplicate Sezai Demirer sorunu çözümü

-- SEÇENEK 1: icloud.com olan test hesabı, silelim (önerilir)
DELETE FROM writer_profiles 
WHERE id = 154 AND email = 'sezaidemirer@icloud.com';

-- SEÇENEK 2: Veya slug'ını değiştir (silmek istemezsen)
-- UPDATE writer_profiles 
-- SET slug = 'sezaidemirer-icloud'
-- WHERE id = 154 AND email = 'sezaidemirer@icloud.com';

-- Kontrol: Artık tek Sezai Demirer kalmalı
SELECT 
    id,
    name,
    slug,
    email,
    profile_image IS NOT NULL as has_photo
FROM writer_profiles
WHERE name ILIKE '%sezai%'
ORDER BY created_at;

