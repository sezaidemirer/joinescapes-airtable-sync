-- MUTLAK NİHAİ ÇÖZÜM: En Temel Trigger
-- AMAÇ: Tüm karmaşıklığı ortadan kaldırıp, bir yeni kullanıcının giriş yapabilmesi için gereken mutlak minimum işlemi yapmak.
-- Bu, sorunun kaynağını %100 izole etmek için son teşhis adımıdır.

-- ----------------------------------------------------------------
-- BÖLÜM 1: TEMİZLİK - Önceki Tüm Mekanizmaları İmha Et
-- ----------------------------------------------------------------
BEGIN;
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_created_final ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user_signup();
    DROP FUNCTION IF EXISTS public.handle_new_user();
    DROP FUNCTION IF EXISTS public.create_user_profile_and_metadata();
COMMIT;


-- ----------------------------------------------------------------
-- BÖLÜM 2: EN BASİT MEKANİZMAYI İNŞA ET
-- ----------------------------------------------------------------

-- Adım 2.1: Dünyanın En Basit Trigger Fonksiyonunu Oluştur
-- Bu fonksiyon SADECE ve SADECE writer_profiles'a kayıt atar. Metadata'ya ASLA dokunmaz.
CREATE OR REPLACE FUNCTION public.create_basic_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Sadece en temel bilgileri kullanarak writer_profiles'a bir satır ekle.
    -- Bu, bir kullanıcının var olması için gereken mutlak minimumdur.
    INSERT INTO public.writer_profiles (user_id, email, name, title)
    VALUES (
        NEW.id,
        NEW.email,
        split_part(NEW.email, '@', 1), -- İsim olarak email'in başını kullan
        'Yazar' -- Zorunlu alan için varsayılan değer
    );
    
    RETURN NEW;
END;
$$;

-- Adım 2.2: Yeni Fonksiyonu Trigger Olarak Bağla
CREATE TRIGGER trigger_create_basic_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_basic_profile_on_signup();


-- ----------------------------------------------------------------
-- BÖLÜM 3: KONTROL
-- Yeni ve basit mekanizmanın kurulduğunu doğrula.
-- ----------------------------------------------------------------
SELECT
    'KONTROL' as section,
    trigger_name,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_basic_profile';
