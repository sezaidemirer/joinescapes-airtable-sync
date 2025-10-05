-- NİHAİ ÇÖZÜM: Yeni Kullanıcı Oluşturma Mekanizmasını Sıfırdan İnşa Etme
-- AMAÇ: Tüm eski trigger/fonksiyonları yok edip, yerine Supabase'in temel kurallarına uygun,
-- ultra-sağlam ve basit yeni bir kullanıcı oluşturma mekanizması kurmak.

-- ----------------------------------------------------------------
-- BÖLÜM 1: TEMİZLİK - Tüm Eski Mekanizmaları Yok Et
-- Önceki tüm denemelerden kalan potansiyel olarak bozuk parçaları sistemden tamamen kaldırıyoruz.
-- ----------------------------------------------------------------
BEGIN;
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user_signup();
    DROP FUNCTION IF EXISTS public.handle_new_user();
COMMIT;


-- ----------------------------------------------------------------
-- BÖLÜM 2: İNŞA - Yeni ve Sağlam Mekanizmayı Kur
-- ----------------------------------------------------------------

-- Adım 2.1: Yeni Trigger Fonksiyonunu Oluştur
-- Bu fonksiyon, mümkün olan en basit ve en temel SQL komutlarını kullanır.
CREATE OR REPLACE FUNCTION public.create_user_profile_and_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_user_role TEXT;
BEGIN
    -- Yeni kullanıcının rolünü metadata'dan al, yoksa 'user' olarak ata.
    v_user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'user');
    
    -- Yeni kullanıcının tam adını metadata'dan al, yoksa email'den türet.
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'), ''),
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Adım 2.1.1: Önce `writer_profiles` tablosuna temel bir kayıt ekle.
    -- Bu, sistemdeki en temel ve en önemli adımdır.
    INSERT INTO public.writer_profiles (user_id, name, email, is_approved)
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        -- Eğer kullanıcı 'editör' rolüyle kayıt oluyorsa, onaylanmamış olarak başlar.
        -- Diğer tüm roller (örn: 'user') otomatik onaylıdır.
        (CASE WHEN v_user_role = 'editor' THEN false ELSE true END)
    );

    -- Adım 2.1.2: Şimdi, `auth.users` tablosundaki metadata'yı standartlaştır.
    -- Bu, `writer_profiles` kaydı oluşturulduktan SONRA yapılır.
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'user_role', v_user_role,
        'full_name', v_full_name,
        'editor_approved', (CASE WHEN v_user_role = 'editor' THEN false ELSE null END)
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Adım 2.2: Yeni Fonksiyonu Trigger Olarak Bağla
-- Bu trigger, her yeni kullanıcı eklendikten HEMEN SONRA çalışır.
CREATE TRIGGER on_auth_user_created_final
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_profile_and_metadata();


-- ----------------------------------------------------------------
-- BÖLÜM 3: KONTROL
-- Yeni mekanizmanın kurulduğunu doğrula.
-- ----------------------------------------------------------------
SELECT
    'KONTROL' as section,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created_final';

SELECT
    'KONTROL' as section,
    routine_name
FROM information_schema.routines
WHERE routine_name = 'create_user_profile_and_metadata';
