-- Writer Profiles Tablosunu Güncelleme
-- Mevcut tabloya yeni alanlar ekleyelim

-- Yeni alanları ekle (eğer yoksa)
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS idx_writer_profiles_approved ON writer_profiles(is_approved);
CREATE INDEX IF NOT EXISTS idx_writer_profiles_created_at ON writer_profiles(created_at);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_writer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı ekle (eğer yoksa)
DROP TRIGGER IF EXISTS trigger_update_writer_profiles_updated_at ON writer_profiles;
CREATE TRIGGER trigger_update_writer_profiles_updated_at
  BEFORE UPDATE ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_writer_profiles_updated_at();

-- Fonksiyon: Writer profili oluşturma (editör kayıt için)
CREATE OR REPLACE FUNCTION create_writer_profile_on_signup(
  p_user_id UUID,
  p_first_name VARCHAR(100),
  p_last_name VARCHAR(100),
  p_birth_date DATE,
  p_email VARCHAR(255)
)
RETURNS UUID AS $$
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
    is_approved
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
    false -- Onay bekliyor
  ) RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonksiyon: Editör onaylama
CREATE OR REPLACE FUNCTION approve_writer(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- writer_profiles tablosunda onay durumunu güncelle
  UPDATE writer_profiles 
  SET is_approved = true, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- User metadata'yı da güncelle
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || '{"editor_approved": true}'::jsonb
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonksiyon: Editör reddetme
CREATE OR REPLACE FUNCTION reject_writer(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- writer_profiles tablosundan sil
  DELETE FROM writer_profiles WHERE user_id = p_user_id;
  
  -- User metadata'yı da güncelle
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || '{"editor_approved": false}'::jsonb
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut kayıtları güncelle (eğer first_name, last_name boşsa)
UPDATE writer_profiles 
SET 
  first_name = CASE 
    WHEN first_name IS NULL OR first_name = '' THEN 
      CASE 
        WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 1)
        ELSE name
      END
    ELSE first_name
  END,
  last_name = CASE 
    WHEN last_name IS NULL OR last_name = '' THEN 
      CASE 
        WHEN position(' ' in name) > 0 THEN 
          substring(name from position(' ' in name) + 1)
        ELSE ''
      END
    ELSE last_name
  END,
  is_approved = COALESCE(is_approved, true), -- Mevcut yazarlar onaylı sayılır
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE first_name IS NULL OR last_name IS NULL OR is_approved IS NULL;

COMMENT ON COLUMN writer_profiles.first_name IS 'Editörün adı';
COMMENT ON COLUMN writer_profiles.last_name IS 'Editörün soyadı';
COMMENT ON COLUMN writer_profiles.birth_date IS 'Doğum tarihi';
COMMENT ON COLUMN writer_profiles.is_approved IS 'Admin onayı durumu';
