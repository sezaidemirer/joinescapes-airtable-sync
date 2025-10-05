-- ============================================
-- FIX_SUPABASE_WARNINGS.sql
-- Supabase Security Advisor uyarılarını düzelt
-- ============================================

-- ============================================
-- 1. test_approve_editor fonksiyonunu düzelt
-- ============================================
CREATE OR REPLACE FUNCTION public.test_approve_editor(editor_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Kullanıcının metadata'sını güncelle
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'user_role', 'editor',
    'editor_approved', true,
    'is_approved', true
  )
  WHERE id = editor_user_id;
  
  -- Writer profile'ı güncelle
  UPDATE public.writer_profiles
  SET is_approved = true,
      is_featured = true
  WHERE user_id = editor_user_id;
  
  result = jsonb_build_object(
    'success', true,
    'message', 'Editor approved successfully'
  );
  
  RETURN result;
END;
$$;

-- ============================================
-- 2. save_writer_profile fonksiyonunu düzelt
-- ============================================
CREATE OR REPLACE FUNCTION public.save_writer_profile(
  p_user_id UUID,
  p_name TEXT,
  p_title TEXT,
  p_bio TEXT,
  p_location TEXT,
  p_specialties JSONB,
  p_social_media JSONB,
  p_profile_image TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  UPDATE public.writer_profiles
  SET 
    name = p_name,
    title = p_title,
    bio = p_bio,
    location = p_location,
    specialties = p_specialties,
    social_media = p_social_media,
    profile_image = p_profile_image,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  result = jsonb_build_object(
    'success', true,
    'message', 'Profile updated successfully'
  );
  
  RETURN result;
END;
$$;

-- ============================================
-- 3. create_writer_profile_on_signup fonksiyonunu düzelt
-- ============================================
CREATE OR REPLACE FUNCTION public.create_writer_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.writer_profiles (
    user_id,
    email,
    name,
    title
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Yazar'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. approve_editor_admin fonksiyonunu düzelt
-- ============================================
CREATE OR REPLACE FUNCTION public.approve_editor_admin(editor_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Auth kullanıcısını güncelle
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'user_role', 'editor',
    'editor_approved', true,
    'is_approved', true,
    'approved_at', NOW(),
    'approved_by', auth.uid()
  )
  WHERE id = editor_user_id;
  
  -- Writer profile'ı güncelle
  UPDATE public.writer_profiles
  SET 
    is_approved = true,
    is_featured = true,
    updated_at = NOW()
  WHERE user_id = editor_user_id;
  
  result = jsonb_build_object(
    'success', true,
    'message', 'Editor onaylandı'
  );
  
  RETURN result;
END;
$$;

-- ============================================
-- VERİFİKASYON
-- ============================================
SELECT 
  '✅ Tüm fonksiyonlar güncellendi ve search_path set edildi' as status;

-- Fonksiyonları listele
SELECT 
  routine_name as function_name,
  routine_type as type,
  security_type,
  CASE 
    WHEN prosecdef THEN '🔒 SECURITY DEFINER'
    ELSE '🔓 SECURITY INVOKER'
  END as security_mode
FROM information_schema.routines r
LEFT JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name IN (
    'test_approve_editor',
    'save_writer_profile',
    'create_writer_profile_on_signup',
    'approve_editor_admin'
  )
ORDER BY routine_name;

