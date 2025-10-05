-- ÖNCE slugify fonksiyonunu oluştur, SONRA slug'ları güncelle

-- 1. slugify fonksiyonu oluştur
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(
                                        regexp_replace(
                                            regexp_replace(
                                                regexp_replace(
                                                    value,
                                                    'ı', 'i', 'g'
                                                ),
                                                'İ', 'i', 'g'
                                            ),
                                            'ş', 's', 'g'
                                        ),
                                        'Ş', 's', 'g'
                                    ),
                                    'ğ', 'g', 'g'
                                ),
                                'Ğ', 'g', 'g'
                            ),
                            'ü', 'u', 'g'
                        ),
                        'Ü', 'u', 'g'
                    ),
                    'ö', 'o', 'g'
                ),
                'Ö', 'o', 'g'
            ),
            'ç', 'c', 'g'
        ),
        'Ç', 'c', 'g'
    );
    RETURN regexp_replace(
        regexp_replace(RESULT, '[^a-z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Test: slugify fonksiyonu çalışıyor mu?
SELECT slugify('Sevim Günahkar') as test_slug;

-- 3. TÜM SLUG'LARI YENİDEN OLUŞTUR (name'den)
UPDATE writer_profiles
SET slug = slugify(name);

-- 4. Kontrol: Yeni slug'ları göster
SELECT 
    id,
    name,
    slug,
    email,
    '✅ YENİ SLUG' as durum
FROM writer_profiles
ORDER BY created_at DESC;

