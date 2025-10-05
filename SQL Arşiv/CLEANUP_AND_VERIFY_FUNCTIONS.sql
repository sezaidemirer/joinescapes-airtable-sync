-- NİHAİ FONKSİYON TEMİZLİĞİ VE DOĞRULAMA
-- AMAÇ: Supabase Güvenlik Danışmanı'nda listelenen tüm eski, kullanılmayan ve hatalı fonksiyonları
-- sistemden tamamen kaldırarak uyarıları temizlemek ve mevcut, doğru fonksiyonların yerinde olduğunu doğrulamak.

-- ----------------------------------------------------------------
-- BÖLÜM 1: TEMİZLİK OPERASYONU
-- Aşağıdaki fonksiyonlar, Güvenlik Danışmanı'nda listelenen ve artık kullanılmayan eski denemelerdir.
-- Bunları sistemden tamamen kaldırıyoruz.
-- ----------------------------------------------------------------
BEGIN;

    -- Güvenlik Danışmanı'nda listelenen eski fonksiyonları sil:
    DROP FUNCTION IF EXISTS public.auto_featured_writer_on_approval();
    DROP FUNCTION IF EXISTS public.set_full_name_automatically();
    DROP FUNCTION IF EXISTS public.test_approve_editor(uuid);
    DROP FUNCTION IF EXISTS public.save_writer_profile(text, text);
    DROP FUNCTION IF EXISTS public.create_writer_profile_on_signup();
    DROP FUNCTION IF EXISTS public.update_user_metadata_on_signup();
    DROP FUNCTION IF EXISTS public.auto_featured_on_approval();
    DROP FUNCTION IF EXISTS public.reject_writer(uuid);
    DROP FUNCTION IF EXISTS public.update_writer_profiles_updated_at();
    DROP FUNCTION IF EXISTS public.update_updated_at_column();
    
    -- Önceki denemelerden kalma diğer potansiyel eski fonksiyonları da temizleyelim:
    DROP FUNCTION IF EXISTS public.handle_new_user();
    DROP FUNCTION IF EXISTS public.handle_new_user_signup();
    DROP FUNCTION IF EXISTS public.create_user_profile_and_metadata();
    DROP FUNCTION IF EXISTS public.approve_writer(uuid);
    DROP FUNCTION IF EXISTS public.approve_editor_admin(uuid, text, text, date, text);


COMMIT;

-- ----------------------------------------------------------------
-- BÖLÜM 2: YENİ VE AKTİF FONKSİYONLARI YENİDEN OLUŞTURMA (GARANTİ İÇİN)
-- Sistemde sadece bu güncel ve doğru fonksiyonların kalmasını sağlıyoruz.
-- ----------------------------------------------------------------

-- Adım 2.1: Admin kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((auth.jwt()->'user_metadata'->>'user_role')::text = 'admin', false) $$;

-- Adım 2.2: Onay bekleyenleri getirme fonksiyonu
CREATE OR REPLACE FUNCTION public.get_pending_editors()
RETURNS TABLE (id UUID, email TEXT, created_at TIMESTAMPTZ, first_name TEXT, last_name TEXT, full_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Yetkisiz erişim.'; END IF;
    RETURN QUERY SELECT u.id, u.email, u.created_at, u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'last_name', u.raw_user_meta_data->>'full_name'
    FROM auth.users u WHERE (u.raw_user_meta_data->>'user_role')::text = 'editor' AND (u.raw_user_meta_data->>'editor_approved')::boolean = false
    ORDER BY u.created_at ASC;
END; $$;

-- Adım 2.3: Editör onaylama fonksiyonu
CREATE OR REPLACE FUNCTION public.approve_new_editor(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"user_role":"editor", "editor_approved":true, "approved_at":"' || now() || '"}'::jsonb WHERE id = p_user_id;
    UPDATE writer_profiles SET is_approved = true, is_featured = true WHERE user_id = p_user_id;
END; $$;

-- Adım 2.4: Mutlak son ve en basit kullanıcı oluşturma fonksiyonu ve trigger'ı
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
-- Sistemde sadece doğru fonksiyonların kaldığını doğrula.
-- ----------------------------------------------------------------
SELECT routine_name FROM information_schema.routines
WHERE specific_schema = 'public'
ORDER BY routine_name;
