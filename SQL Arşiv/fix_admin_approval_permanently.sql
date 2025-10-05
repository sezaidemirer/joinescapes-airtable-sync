-- KALICI ÇÖZÜM: Admin onaylama sistemini düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT 'Mevcut Service Role Key Durumu:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') 
    THEN 'Service Role Mevcut' 
    ELSE 'Service Role Eksik' 
  END as service_role_status;

-- 2. Admin onaylama için RPC fonksiyonu oluştur
CREATE OR REPLACE FUNCTION approve_editor_admin(
  p_user_id UUID,
  p_approved_by TEXT DEFAULT 'admin'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- 1. Kullanıcının metadata'sını güncelle
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    jsonb_set(
      jsonb_set(
        raw_user_meta_data,
        '{editor_approved}',
        'true'::jsonb
      ),
      '{is_approved}',
      'true'::jsonb
    ),
    '{approved_by}',
    ('"' || p_approved_by || '"')::jsonb
  )
  WHERE id = p_user_id;
  
  -- 2. Writer profile oluştur veya güncelle
  INSERT INTO writer_profiles (
    name,
    title,
    bio,
    location,
    is_featured,
    user_id,
    created_at,
    updated_at
  )
  SELECT 
    COALESCE(au.raw_user_meta_data->>'first_name', '') || ' ' || 
    COALESCE(au.raw_user_meta_data->>'last_name', '') as name,
    'Editör & Seyahat Yazarı' as title,
    '' as bio,
    '' as location,
    true as is_featured,
    au.id as user_id,
    NOW() as created_at,
    NOW() as updated_at
  FROM auth.users au
  WHERE au.id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    is_featured = true,
    updated_at = NOW();
  
  -- 3. Sonucu döndür
  SELECT json_build_object(
    'success', true,
    'message', 'Editör başarıyla onaylandı',
    'user_id', p_user_id
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Hata: ' || SQLERRM,
      'user_id', p_user_id
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC fonksiyonuna erişim izni ver
GRANT EXECUTE ON FUNCTION approve_editor_admin(UUID, TEXT) TO authenticated;

-- 4. Test fonksiyonu
CREATE OR REPLACE FUNCTION test_approve_editor()
RETURNS JSON AS $$
DECLARE
  test_user_id UUID;
  result JSON;
BEGIN
  -- Test kullanıcısı bul
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'saykoarmes22@gmail.com' 
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Test kullanıcısı bulunamadı');
  END IF;
  
  -- Onayla
  SELECT approve_editor_admin(test_user_id, 'test_admin') INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Test fonksiyonunu çalıştır
SELECT 'Test Sonucu:' as info;
SELECT test_approve_editor();

-- 6. Sonuçları kontrol et
SELECT 'Onaylanan Editörler:' as info;
SELECT 
  wp.id, 
  wp.name, 
  wp.title, 
  wp.is_featured,
  au.email,
  au.raw_user_meta_data->>'editor_approved' as editor_approved,
  au.raw_user_meta_data->>'is_approved' as is_approved
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.is_featured = true
ORDER BY wp.created_at DESC;
