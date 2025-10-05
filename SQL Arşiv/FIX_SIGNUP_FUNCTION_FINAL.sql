-- SORUN: create_writer_profile_on_signup fonksiyonu slug eklemiyor!
-- ÇÖZÜM: Fonksiyonu güncelle, slug ekle (trigger otomatik doldurur)

-- ESKİ FONKSİYONU YENİSİYLE DEĞİŞTİR
CREATE OR REPLACE FUNCTION public.create_writer_profile_on_signup(
  p_user_id uuid, 
  p_first_name character varying, 
  p_last_name character varying, 
  p_birth_date date, 
  p_email character varying
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profile_id UUID;
  full_name TEXT;
  bio_text TEXT;
BEGIN
  -- Tam adı oluştur
  full_name := p_first_name || ' ' || p_last_name;
  
  -- Bio boş bırak (kullanıcı sonradan dolduracak)
  bio_text := '';
  
  INSERT INTO writer_profiles (
    user_id,
    name,
    first_name,
    last_name,
    birth_date,
    title,
    bio,
    location,
    profile_image,
    specialties,
    social_media,
    is_featured,
    is_approved,
    slug  -- 🎯 SLUG EKLE! (trigger otomatik doldurur)
  ) VALUES (
    p_user_id,
    full_name,
    p_first_name,
    p_last_name,
    p_birth_date,
    '', -- BOŞ - kullanıcı sonradan dolduracak
    bio_text, -- BOŞ - kullanıcı sonradan dolduracak
    '', -- BOŞ - kullanıcı sonradan dolduracak
    '', -- BOŞ - kullanıcı sonradan dolduracak
    ARRAY[]::TEXT[], -- BOŞ array - kullanıcı sonradan dolduracak
    '{}'::jsonb, -- BOŞ object - kullanıcı sonradan dolduracak
    false,
    false, -- Onay bekliyor
    NULL  -- 🎯 SLUG NULL = Trigger çalışır ve name'den slug oluşturur!
  ) RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$function$;

-- TEST: Fonksiyon güncellendi mi?
SELECT 
    p.proname as function_name,
    'FONKSİYON GÜNCELLENDİ ✅' as durum
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_writer_profile_on_signup';

-- 🎉 ARTIK YENİ KAYITLARDA:
-- 1. Fonksiyon slug = NULL olarak ekliyor
-- 2. Trigger devreye giriyor
-- 3. Trigger name'den slug oluşturuyor
-- 4. "Ahmet Yılmaz" → "ahmet-yilmaz" ✅

