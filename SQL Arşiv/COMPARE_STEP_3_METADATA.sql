-- Karşılaştırma Adım 3: raw_user_meta_data Detayları
-- En kritik bölüm. Metadata içerisindeki tüm anahtar/değer çiftlerini satır satır karşılaştırır.
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
