-- KESİN ÇÖZÜM: Yeni Kullanıcılar için Otomatik Sağlama
-- AMAÇ: Her yeni kayıt olan kullanıcının metadata ve profilini, çalışan referans yapıyla %100 uyumlu şekilde otomatik olarak oluşturmak.

-- Adım 1: Mevcut eski trigger'ı (varsa) kaldır ki çakışma olmasın.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_signup();


-- Adım 2: Yeni, akıllı trigger fonksiyonunu oluştur.
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
    v_new_metadata JSONB;
BEGIN
    -- 1. Signup sırasında gönderilen isim ve soyisimi al.
    --    Client-side'dan `options: { data: { first_name: '...', last_name: '...' } }` şeklinde gönderilmeli.
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    
    -- Eğer isim soyisim yoksa veya boşsa, email'den türet.
    IF v_first_name IS NULL OR v_last_name IS NULL OR TRIM(v_first_name) = '' THEN
        v_full_name := split_part(NEW.email, '@', 1);
        v_first_name := v_full_name;
        v_last_name := '';
    ELSE
        v_full_name := v_first_name || ' ' || v_last_name;
    END IF;

    -- 2. Çalışan referans kullanıcı yapısını BİREBİR taklit eden YENİ metadata'yı oluştur.
    v_new_metadata := jsonb_build_object(
        'email', NEW.email,
        'user_role', 'user', -- Başlangıçta 'user', admin onayı ile 'editor' olacak.
        'editor_approved', false,
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
        'approved_at', null, -- Onaylanınca dolacak
        'approved_by', null, -- Onaylanınca dolacak
        'birth_date', ''
    );

    -- 3. Yeni kullanıcının metadata'sını bu standart yapı ile GÜNCELLE.
    UPDATE auth.users
    SET raw_user_meta_data = v_new_metadata
    WHERE id = NEW.id;

    -- 4. writer_profiles tablosuna ilgili kaydı oluştur.
    INSERT INTO public.writer_profiles (user_id, name, email, title, first_name, last_name, is_approved, is_featured)
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        'Yazar',
        v_first_name,
        v_last_name,
        false, -- Başlangıçta false
        false -- Başlangıçta false
    );

    RETURN NEW;
END;
$$;

-- Adım 3: Fonksiyonu auth.users tablosuna trigger olarak bağla.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_signup();

-- Adım 4: Admin onay fonksiyonunu, sadece gerekli alanları güncelleyecek şekilde basitleştir.
-- Bu fonksiyon, admin panelinden bir kullanıcıyı onaylarken çağrılır.
CREATE OR REPLACE FUNCTION public.approve_new_editor(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'user_role', 'editor',
        'editor_approved', true,
        'approved_at', now()
    )
    WHERE id = p_user_id;

    UPDATE writer_profiles
    SET 
        is_approved = true,
        is_featured = true -- Onaylanan yazarı öne çıkan yap
    WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_new_editor(UUID) TO authenticated;

-- KONTROL: Fonksiyon ve trigger'ın oluştuğunu doğrula.
SELECT
    'KONTROL' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user_signup', 'approve_new_editor');

SELECT
    'KONTROL' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';
