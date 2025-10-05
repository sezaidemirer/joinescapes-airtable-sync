-- YENİ YAZARLAR İÇİN OTOMATİK SLUG OLUŞTURMA TRİGGER'I
-- Bu çalıştıktan sonra her yeni yazar kaydında otomatik slug oluşur!

-- 1. Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION auto_generate_writer_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer slug boş ise, name'den otomatik oluştur
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Türkçe karakterleri İngilizce'ye çevir
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
    
    -- Ç harfini çevir
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.slug, 'Ç', 'c', 'g'));
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.slug, 'ç', 'c', 'g'));
    
    -- Özel karakterleri temizle ve boşlukları tire yap
    NEW.slug := REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.slug, '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'),
    '-+', '-', 'g');
    
    -- Baştaki ve sondaki tire'leri temizle
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Eski trigger'ı sil (varsa)
DROP TRIGGER IF EXISTS trigger_auto_generate_writer_slug ON writer_profiles;

-- 3. Yeni trigger oluştur (INSERT ve UPDATE'de çalışır)
CREATE TRIGGER trigger_auto_generate_writer_slug
  BEFORE INSERT OR UPDATE ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_writer_slug();

-- 4. Test: Mevcut writer'ları göster
SELECT 
    id,
    name,
    slug,
    email,
    '✅ TRİGGER AKTİF - Yeni kayıtlarda otomatik slug oluşur!' as durum
FROM writer_profiles
ORDER BY created_at DESC;

-- 5. Trigger kontrol
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'writer_profiles';

