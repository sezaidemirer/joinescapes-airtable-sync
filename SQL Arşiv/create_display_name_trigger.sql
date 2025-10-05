-- YENİ KULLANICILAR İÇİN OTOMATIK DISPLAY_NAME TRIGGER'I
-- Bu trigger yeni kullanıcı kayıt olduğunda otomatik çalışır

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION set_display_name_automatically()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer first_name veya last_name varsa, bunlarla display_name oluştur
  IF NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
     OR NEW.raw_user_meta_data->>'last_name' IS NOT NULL THEN
    NEW.display_name := TRIM(
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || 
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  -- Aksi takdirde email'den al
  ELSE
    NEW.display_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eski trigger'ı sil
DROP TRIGGER IF EXISTS trigger_set_display_name_auto ON auth.users;

-- Yeni trigger'ı oluştur
CREATE TRIGGER trigger_set_display_name_auto
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_display_name_automatically();

-- Trigger'ın oluştuğunu kontrol et
SELECT 
  'TRIGGER KONTROL' as durum,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';



