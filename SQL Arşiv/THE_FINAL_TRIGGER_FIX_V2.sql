-- NİHAİ ÇÖZÜM V2: Yeni Kullanıcı Oluşturma Mekanizmasını Tamir Etme
-- AMAÇ: Önceki trigger'da eksik olan 'title' gibi zorunlu alanları ekleyerek kayıt hatasını çözmek.

-- ----------------------------------------------------------------
-- BÖLÜM 1: İNŞA - Tamir Edilmiş ve Sağlam Mekanizmayı Kur
-- ----------------------------------------------------------------

-- Adım 1.1: Trigger Fonksiyonunu Güncelle
-- Bu versiyon, `writer_profiles` tablosuna kayıt atarken zorunlu olan 'title' alanını içerir.
CREATE OR REPLACE FUNCTION public.create_user_profile_and_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_user_role TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Yeni kullanıcının rolünü metadata'dan al, yoksa 'user' olarak ata.
    v_user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'user');
    
    -- İsim/soyisim bilgilerini al
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    
    -- Yeni kullanıcının tam adını oluştur, bilgi yoksa email'den türet.
    IF v_first_name IS NULL OR v_last_name IS NULL OR TRIM(v_first_name) = '' THEN
        v_full_name := split_part(NEW.email, '@', 1);
        v_first_name := v_full_name;
        v_last_name := '';
    ELSE
        v_full_name := v_first_name || ' ' || v_last_name;
    END IF;

    -- Adım 1.2: `writer_profiles` tablosuna TAM ve EKSİKSİZ bir kayıt ekle.
    INSERT INTO public.writer_profiles (user_id, name, email, title, first_name, last_name, is_approved)
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        'Yazar', -- EKSİK OLAN PARÇA: Varsayılan bir başlık ekliyoruz.
        v_first_name, -- İsim bilgisini de ekleyelim
        v_last_name, -- Soyisim bilgisini de ekleyelim
        (CASE WHEN v_user_role = 'editor' THEN false ELSE true END)
    );

    -- Adım 1.3: `auth.users` tablosundaki metadata'yı standartlaştır.
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'user_role', v_user_role,
        'full_name', v_full_name,
        'first_name', v_first_name,
        'last_name', v_last_name,
        'editor_approved', (CASE WHEN v_user_role = 'editor' THEN false ELSE null END)
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;


-- ----------------------------------------------------------------
-- BÖLÜM 2: KONTROL
-- Fonksiyonun güncellendiğini doğrula.
-- ----------------------------------------------------------------
SELECT
    'KONTROL' as section,
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_user_profile_and_metadata';
