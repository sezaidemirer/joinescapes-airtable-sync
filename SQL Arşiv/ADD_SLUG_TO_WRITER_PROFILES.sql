-- Writer profiles tablosuna slug kolonu ekle ve mevcut yazarlar için slug oluştur

-- 1. Slug kolonunu ekle
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2. Slug oluşturma fonksiyonu (Türkçe karakter desteği ile)
CREATE OR REPLACE FUNCTION generate_writer_slug(writer_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(writer_name, 'ğ', 'g', 'g'),
              'ü', 'u', 'g'),
            'ş', 's', 'g'),
          'ı', 'i', 'g'),
        'ö', 'o', 'g'),
      'ç', 'c', 'g'),
    '[^a-z0-9\s-]', '', 'g')
  );
  RETURN REGEXP_REPLACE(TRIM(result), '\s+', '-', 'g');
END;
$$ LANGUAGE plpgsql;

-- 3. Mevcut tüm yazarlar için slug oluştur
UPDATE writer_profiles
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(name, 'Ğ', 'g', 'g'),
                'ğ', 'g', 'g'),
              'Ü', 'u', 'g'),
            'ü', 'u', 'g'),
          'Ş', 's', 'g'),
        'ş', 's', 'g')
      ),
    'İ', 'i', 'g'),
  'ı', 'i', 'g')
);

UPDATE writer_profiles
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(slug, 'Ö', 'o', 'g'),
    'ö', 'o', 'g'),
  'Ç', 'c', 'g')
);

UPDATE writer_profiles
SET slug = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'),
'-+', '-', 'g');

-- 4. Slug kolonunu unique yap (index ekle)
CREATE UNIQUE INDEX IF NOT EXISTS idx_writer_profiles_slug ON writer_profiles(slug);

-- 5. Trigger: Yeni yazar eklendiğinde otomatik slug oluştur
CREATE OR REPLACE FUNCTION auto_generate_writer_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        REGEXP_REPLACE(NEW.name, 'Ğ', 'g', 'g'),
                      'ğ', 'g', 'g'),
                    'Ü', 'u', 'g'),
                  'ü', 'u', 'g'),
                'Ş', 's', 'g'),
              'ş', 's', 'g'),
            'İ', 'i', 'g'),
          'ı', 'i', 'g'),
        'Ö', 'o', 'g'),
      'ö', 'o', 'g')
    );
    
    NEW.slug := LOWER(
      REGEXP_REPLACE(NEW.slug, 'Ç', 'c', 'g')
    );
    
    NEW.slug := LOWER(
      REGEXP_REPLACE(NEW.slug, 'ç', 'c', 'g')
    );
    
    NEW.slug := REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.slug, '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'),
    '-+', '-', 'g');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_writer_slug ON writer_profiles;
CREATE TRIGGER trigger_auto_generate_writer_slug
  BEFORE INSERT OR UPDATE ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_writer_slug();

-- 6. Kontrol: Oluşturulan slug'ları göster
SELECT 
    id,
    name,
    slug,
    email
FROM writer_profiles
ORDER BY name;

