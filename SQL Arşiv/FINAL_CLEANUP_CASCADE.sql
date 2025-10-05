-- NİHAİ TEMİZLİK OPERASYONU (CASCADE İLE)
-- AMAÇ: Birbirine bağlı eski fonksiyonları ve tetikleyicileri (trigger) tek seferde, kökünden temizlemek.

-- ----------------------------------------------------------------
-- BÖLÜM 1: TEMİZLİK - CASCADE (DOMİNO ETKİSİ) KULLANARAK
-- 'CASCADE' komutu, bir fonksiyonu silerken, ona bağlı olan tüm diğer objeleri (trigger gibi) de otomatik olarak siler.
-- ----------------------------------------------------------------
BEGIN;

    -- Hata veren fonksiyonu ve ona bağlı her şeyi 'CASCADE' ile sil:
    DROP FUNCTION IF EXISTS public.auto_featured_writer_on_approval() CASCADE;
    
    -- Güvenlik Danışmanı'nda listelenen diğer tüm eski ve gereksiz fonksiyonları da CASCADE ile silerek garantili temizlik yapalım.
    DROP FUNCTION IF EXISTS public.set_full_name_automatically() CASCADE;
    DROP FUNCTION IF EXISTS public.test_approve_editor(uuid) CASCADE;
    DROP FUNCTION IF EXISTS public.save_writer_profile(text, text) CASCADE;
    DROP FUNCTION IF EXISTS public.create_writer_profile_on_signup() CASCADE;
    DROP FUNCTION IF EXISTS public.update_user_metadata_on_signup() CASCADE;
    DROP FUNCTION IF EXISTS public.auto_featured_on_approval() CASCADE;
    DROP FUNCTION IF EXISTS public.reject_writer(uuid) CASCADE;
    DROP FUNCTION IF EXISTS public.update_writer_profiles_updated_at() CASCADE;
    DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
    
    -- Önceki denemelerden kalma diğer tüm potansiyel eski mekanizmaları da kökünden temizle:
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_created_final ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;
    DROP FUNCTION IF EXISTS public.create_user_profile_and_metadata() CASCADE;
    DROP FUNCTION IF EXISTS public.approve_writer(uuid) CASCADE;
    DROP FUNCTION IF EXISTS public.approve_editor_admin(uuid, text, text, date, text) CASCADE;

COMMIT;

-- ----------------------------------------------------------------
-- BÖLÜM 2: GÜNCEL SİSTEMİ YENİDEN KURMA
-- Temizlikten sonra, şu an kullandığımız en güncel ve en basit sistemi yeniden kurarak her şeyin yerli yerinde olduğundan emin oluyoruz.
-- ----------------------------------------------------------------

-- Adım 2.1: Admin kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((auth.jwt()->'user_metadata'->>'user_role')::text = 'admin', false) $$;

-- Adım 2.2: En basit ve sağlam kullanıcı oluşturma mekanizması
DROP TRIGGER IF EXISTS trigger_create_basic_profile ON auth.users;
CREATE OR REPLACE FUNCTION public.create_basic_profile_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.writer_profiles (user_id, email, name, title)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'Yazar');
    RETURN NEW;
END; $$;
CREATE TRIGGER trigger_create_basic_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.create_basic_profile_on_signup();


-- ----------------------------------------------------------------
-- BÖLÜM 3: SON KONTROL
-- Sistemde sadece olması gereken parçaların kaldığını doğrula.
-- ----------------------------------------------------------------
SELECT routine_name FROM information_schema.routines
WHERE specific_schema = 'public'
ORDER BY routine_name;

SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public';
