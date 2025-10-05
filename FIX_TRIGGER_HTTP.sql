-- Trigger'ı düzelt: net yerine http kullan

-- 1. Eski trigger'ı kaldır
DROP TRIGGER IF EXISTS posts_update_airtable_trigger ON posts;
DROP FUNCTION IF EXISTS trigger_update_airtable();

-- 2. Yeni trigger fonksiyonu oluştur (http extension kullanarak)
CREATE OR REPLACE FUNCTION trigger_update_airtable()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  response http_response;
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
    SELECT * INTO response FROM http((
      'POST',
      'https://zhyrmasdozeptezoomnq.supabase.co/functions/v1/update-airtable',
      ARRAY[http_header('Content-Type', 'application/json'),
            http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeXJtYXNkb3plcHRlem9vbW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4NDg2NSwiZXhwIjoyMDY0NDYwODY1fQ.VOPQzkDxHPWcJ0PS2cZ5hfCnkdqV5ueXyz40UL8Zc8g')],
      'application/json',
      payload::text
    ));
      
    RAISE NOTICE 'Airtable güncelleme tetiklendi: % (Status: %)', NEW.airtable_record_id, response.status;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Yeni trigger oluştur
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
