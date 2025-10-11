-- Airtable Trigger'ını Düzelt (Net Extension Olmadan)
-- HTTP çağrısı yerine sadece log tut, Airtable güncellemesini devre dışı bırak

-- 1. Eski trigger'ı kaldır
DROP TRIGGER IF EXISTS posts_update_airtable_trigger ON posts;

-- 2. Basit trigger fonksiyonu oluştur (sadece log)
CREATE OR REPLACE FUNCTION trigger_update_airtable()
RETURNS TRIGGER AS $$
BEGIN
  -- Sadece airtable_record_id olan kayıtlar için çalış
  IF NEW.airtable_record_id IS NOT NULL THEN
    
    -- Eğer sadece category_id değiştiyse, log tut
    IF (OLD.category_id IS DISTINCT FROM NEW.category_id) AND 
       (OLD.title = NEW.title) AND 
       (OLD.content = NEW.content) THEN
      RAISE NOTICE 'Kategori değişikliği tespit edildi (Airtable güncellemesi yok): %', NEW.airtable_record_id;
      RETURN NEW;
    END IF;
    
    -- Title veya content değiştiyse, log tut
    IF (OLD.title IS DISTINCT FROM NEW.title) OR (OLD.content IS DISTINCT FROM NEW.content) THEN
      RAISE NOTICE 'Title/Content değişikliği tespit edildi (manuel Airtable güncellemesi gerekebilir): %', NEW.airtable_record_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Yeni trigger'ı oluştur
CREATE TRIGGER posts_update_airtable_trigger
  AFTER UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_airtable();

-- 4. Test: Trigger'ın çalışıp çalışmadığını kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
  AND trigger_name = 'posts_update_airtable_trigger';

-- ✅ Trigger güncellendi: Artık sadece log tutuyor, HTTP çağrısı yapmıyor!
-- ⚠️ Manuel Airtable güncellemeleri için ayrı bir sistem kurman gerekebilir

