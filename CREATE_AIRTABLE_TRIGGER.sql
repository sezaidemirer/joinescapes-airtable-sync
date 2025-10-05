-- Supabase Database Trigger: Posts tablosunda UPDATE olduğunda Airtable'ı güncelle

-- 1. Edge Function'ı çağıran trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION trigger_update_airtable()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Sadece airtable_record_id olan kayıtlar için çalış
  IF NEW.airtable_record_id IS NOT NULL THEN
    
    -- Payload hazırla
    payload := json_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'content', NEW.content,
      'airtable_record_id', NEW.airtable_record_id
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
      
    RAISE NOTICE 'Airtable güncelleme tetiklendi: %', NEW.airtable_record_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger oluştur
DROP TRIGGER IF EXISTS posts_update_airtable_trigger ON posts;

CREATE TRIGGER posts_update_airtable_trigger
  AFTER UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_airtable();

-- 3. Test: Trigger'ın çalışıp çalışmadığını kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
  AND trigger_name = 'posts_update_airtable_trigger';

-- 4. Test: Bir post'u güncelle (airtable_record_id olan)
-- UPDATE posts 
-- SET title = 'TEST: Trigger Test'
-- WHERE airtable_record_id IS NOT NULL
-- LIMIT 1;
