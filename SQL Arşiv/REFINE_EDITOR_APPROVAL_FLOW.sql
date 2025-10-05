-- EDİTÖR ONAY AKIŞINI İYİLEŞTİRME
-- AMAÇ: Yeni kayıt olan kullanıcıların rollerinin doğru atanmasını ve admin panelinde doğru şekilde listelenmesini sağlamak.

-- ----------------------------------------------------------------
-- BÖLÜM 1: Yeni Kullanıcı Oluşturma Trigger'ını Akıllandırma
-- Mevcut trigger fonksiyonunu, kayıt sırasında seçilen rolü dikkate alacak şekilde günceller.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_role TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
    v_new_metadata JSONB;
BEGIN
    -- Adım 1: Kayıt sırasında client'tan gönderilen rolü al. Eğer rol belirtilmemişse, 'user' olarak varsay.
    v_user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'user');

    -- Adım 2: İsim/soyisim bilgilerini al veya email'den türet.
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    
    IF v_first_name IS NULL OR v_last_name IS NULL OR TRIM(v_first_name) = '' THEN
        v_full_name := split_part(NEW.email, '@', 1);
        v_first_name := v_full_name;
        v_last_name := '';
    ELSE
        v_full_name := v_first_name || ' ' || v_last_name;
    END IF;

    -- Adım 3: Standart metadata yapısını, gelen rolü dikkate alarak oluştur.
    v_new_metadata := jsonb_build_object(
        'email', NEW.email,
        'user_role', v_user_role, -- Gelen rolü AYNEN KULLAN. ARTIK 'user' OLARAK EZİLMEYECEK.
        'editor_approved', (CASE WHEN v_user_role = 'editor' THEN false ELSE null END), -- Sadece editörlerin onaya ihtiyacı var.
        'first_name', v_first_name,
        'last_name', v_last_name,
        'full_name', v_full_name,
        'author_name', split_part(NEW.email, '@', 1),
        'author_title', 'Yazar',
        'profile_image', '',
        'bio', '',
        'location', '',
        'social_media', '{}'::jsonb,
        'specialties', '[]'::jsonb,
        'approved_at', null,
        'approved_by', null,
        'birth_date', ''
    );

    -- Adım 4: Yeni kullanıcının metadata'sını bu yeni, akıllı yapı ile güncelle.
    UPDATE auth.users
    SET raw_user_meta_data = v_new_metadata
    WHERE id = NEW.id;

    -- Adım 5: writer_profiles tablosuna ilgili kaydı oluştur.
    INSERT INTO public.writer_profiles (user_id, name, email, title, first_name, last_name, is_approved, is_featured)
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        'Yazar',
        v_first_name,
        v_last_name,
        (CASE WHEN v_user_role = 'editor' THEN false ELSE true END), -- Normal kullanıcılar otomatik onaylıdır.
        false
    );

    RETURN NEW;
END;
$$;


-- ----------------------------------------------------------------
-- BÖLÜM 2: Admin Panelinin Onay Bekleyenleri Getirme Fonksiyonunu Netleştirme
-- Mevcut fonksiyonu, sadece 'onay bekleyen editör' rolündeki kişileri getirecek şekilde günceller.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_pending_editors()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Sadece adminler bu işlemi yapabilir.';
    END IF;

    -- ARTIK DAHA NET: Sadece rolü 'editor' olan VE henüz onaylanmamış olanları getir.
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.created_at,
        u.raw_user_meta_data->>'first_name' AS first_name,
        u.raw_user_meta_data->>'last_name' AS last_name,
        u.raw_user_meta_data->>'full_name' AS full_name
    FROM auth.users u
    WHERE 
        (u.raw_user_meta_data->>'user_role')::text = 'editor'
        AND (u.raw_user_meta_data->>'editor_approved')::boolean = false
    ORDER BY u.created_at ASC;
END;
$$;

-- KONTROL
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user_signup', 'get_pending_editors') AND specific_schema = 'public';
