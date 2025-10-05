-- Yeni Kullanıcılar için Otomatik Profil Trigger'ı
-- Her yeni kullanıcı kaydında otomatik writer_profiles oluştur

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_name TEXT;
BEGIN
    -- İsim oluştur (full_name varsa onu kullan, yoksa email'den)
    v_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', ' '),
        split_part(NEW.email, '@', 1)
    );
    
    -- writer_profiles kaydı oluştur
    INSERT INTO public.writer_profiles (user_id, name, email, title, is_featured)
    VALUES (
        NEW.id,
        v_name,
        NEW.email,
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' IN ('editor', 'yazar', 'supervisor') THEN 'Yazar'
            ELSE 'Kullanıcı'
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' IN ('editor', 'yazar', 'supervisor') THEN true
            ELSE false
        END
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Mevcut trigger'ı sil ve yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger'ı kontrol et
SELECT 
    'TRIGGER DURUMU' as test_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'on_auth_user_created';
