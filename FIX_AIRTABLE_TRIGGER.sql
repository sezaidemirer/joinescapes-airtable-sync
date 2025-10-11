-- Airtable Trigger'ını Düzelt
-- Kategori değişikliklerini Airtable'a geri gönderme, sadece title ve content güncelle

-- 1. Eski trigger'ı kaldır
DROP TRIGGER IF EXISTS posts_update_airtable_trigger ON posts;

-- 2. Yeni, akıllı trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION trigger_update_airtable()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Sadece airtable_record_id olan kayıtlar için çalış
  IF NEW.airtable_record_id IS NOT NULL THEN
    
    -- ⚠️ Sadece kullanıcı tarafından manuel değiştirilen alanları gönder
    -- category_id, status, tags gibi otomatik alanlara dokunma!
    
    -- Eğer sadece category_id değiştiyse, Airtable'a gönderme (sonsuz döngüyü engelle)
    IF (OLD.category_id IS DISTINCT FROM NEW.category_id) AND 
       (OLD.title = NEW.title) AND 
       (OLD.content = NEW.content) THEN
      RAISE NOTICE 'Kategori değişikliği tespit edildi, Airtable güncellemesi atlanıyor: %', NEW.airtable_record_id;
      RETURN NEW;
    END IF;
    
    -- Payload hazırla (sadece önemli alanlar)
    payload := json_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'content', NEW.content,
      'airtable_record_id', NEW.airtable_record_id
      -- category_id'yi GÖNDERMİYORUZ!
    );
    
    -- Edge Function'ı çağır (HTTP request)
    PERFORM
      net.http_post(
        url := 'https://zhyrmasdozeptezoomnq.supabase.co/functions/v1/update-airtable',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := payload::jsonb
      );
      
    RAISE NOTICE 'Airtable güncelleme tetiklendi (sadece title/content): %', NEW.airtable_record_id;
    
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

-- ✅ Trigger güncellendi: Artık kategori değişikliklerinde Airtable'a gönderim yapmıyor!

