-- SECURITY DEFINER Fonksiyonlarını Düzelt - Fonksiyon Tiplerini Önce Sil
-- Mevcut fonksiyonları sil ve yeniden oluştur

-- 1. Mevcut fonksiyonları sil
DROP FUNCTION IF EXISTS public.save_writer_profile(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.approve_writer(UUID);
DROP FUNCTION IF EXISTS public.approve_editor_admin(UUID, TEXT, TEXT, DATE, TEXT);

-- 2. save_writer_profile fonksiyonu
CREATE OR REPLACE FUNCTION public.save_writer_profile(
    p_name TEXT, 
    p_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.writer_profiles (user_id, name, email)
    VALUES (auth.uid(), p_name, p_email)
    ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_writer_profile(TEXT, TEXT) TO authenticated;

-- 3. approve_writer fonksiyonu
CREATE OR REPLACE FUNCTION public.approve_writer(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{
        "role": "editor",
        "user_role": "editor",
        "editor_approved": "true",
        "is_approved": "true"
    }'::jsonb
    WHERE id = p_user_id;
    
    UPDATE public.writer_profiles 
    SET is_featured = true
    WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_writer(UUID) TO authenticated;

-- 4. approve_editor_admin fonksiyonu
CREATE OR REPLACE FUNCTION public.approve_editor_admin(
    p_user_id UUID,
    p_first_name TEXT DEFAULT '',
    p_last_name TEXT DEFAULT '',
    p_birth_date DATE DEFAULT '1990-01-01',
    p_email TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    -- Full name oluştur
    v_full_name := COALESCE(
        NULLIF(TRIM(p_first_name || ' ' || p_last_name), ''),
        split_part(p_email, '@', 1)
    );
    
    -- auth.users metadata'sını güncelle
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
        'role', 'editor',
        'user_role', 'editor',
        'editor_approved', 'true',
        'is_approved', 'true',
        'first_name', p_first_name,
        'last_name', p_last_name,
        'full_name', v_full_name,
        'author_name', v_full_name,
        'bio', '',
        'location', '',
        'specialties', '[]'::jsonb,
        'social_media', '{}'::jsonb,
        'author_title', 'Yazar',
        'profile_image', '',
        'email_confirmed', true
    )
    WHERE id = p_user_id;
    
    -- writer_profiles kaydını oluştur/güncelle
    INSERT INTO public.writer_profiles (user_id, name, email, title, is_featured)
    VALUES (p_user_id, v_full_name, p_email, 'Yazar', true)
    ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        title = EXCLUDED.title,
        is_featured = EXCLUDED.is_featured;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_editor_admin(UUID, TEXT, TEXT, DATE, TEXT) TO authenticated;

-- 5. Fonksiyonları kontrol et
SELECT 
    'FONKSİYONLAR' as test_type,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('save_writer_profile', 'approve_writer', 'approve_editor_admin')
ORDER BY routine_name;
