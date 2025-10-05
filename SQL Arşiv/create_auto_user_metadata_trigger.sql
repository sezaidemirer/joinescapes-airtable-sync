-- YENİ KULLANICILAR İÇİN OTOMATIK USER_METADATA GÜNCELLEME
-- Bu trigger yeni kullanıcı kayıt olduğunda otomatik çalışır

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_user_metadata_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer first_name veya last_name yoksa, email'den oluştur
  IF NEW.raw_user_meta_data->>'first_name' IS NULL OR NEW.raw_user_meta_data->>'last_name' IS NULL THEN
    NEW.raw_user_meta_data := NEW.raw_user_meta_data || jsonb_build_object(
      'first_name', COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      'last_name', COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        ''
      ),
      'full_name', COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_update_user_metadata_on_signup ON auth.users;
CREATE TRIGGER trigger_update_user_metadata_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metadata_on_signup();

-- Test için mevcut trigger'ları kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';
