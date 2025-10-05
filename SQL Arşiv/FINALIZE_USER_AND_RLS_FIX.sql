-- SON DÜZELTME: KULLANICI YAPISINI VE RLS'İ STANDARTLAŞTIRMA
-- AMAÇ: Tüm kullanıcıların metadata'sını çalışan referans kullanıcı gibi yapmak ve RLS politikalarını temizlemek.

-- ----------------------------------------------------------------
-- BÖLÜM 1: Bozuk Kullanıcıların Metadata'sını Düzeltme
-- 'gulbahar.semra@hotmail.com' ve diğerlerini, 'demirersezai@gmail.com' yapısına göre günceller.
-- ----------------------------------------------------------------

-- Adım 1.1: Önce writer_profiles'daki isimleri düzeltelim (eğer email'den türemişse)
UPDATE writer_profiles
SET 
    name = COALESCE(NULLIF(TRIM(first_name || ' ' || last_name), ''), name),
    first_name = COALESCE(first_name, split_part(name, ' ', 1)),
    last_name = COALESCE(last_name, split_part(name, ' ', 2))
WHERE email IN ('gulbahar.semra@hotmail.com', 'inspirationaltechtalks@gmail.com', 'a.sacli82@gmail.com', 'demirersezai1@gmail.com');


-- Adım 1.2: Şimdi auth.users metadata'sını formatlayalım
UPDATE auth.users u
SET raw_user_meta_data = jsonb_build_object(
    'email', u.email,
    'user_role', 'editor',
    'editor_approved', true,
    'is_approved', true, -- Bu alanı standart olarak ekliyoruz
    'first_name', wp.first_name,
    'last_name', wp.last_name,
    'full_name', wp.name,
    'author_name', split_part(u.email, '@', 1), -- Standart olarak email'in başı
    'author_title', wp.title,
    'profile_image', wp.profile_image,
    'bio', wp.bio,
    'location', wp.location,
    'social_media', wp.social_media,
    'specialties', wp.specialties
)
FROM writer_profiles wp
WHERE u.id = wp.user_id 
AND u.email IN ('gulbahar.semra@hotmail.com', 'inspirationaltechtalks@gmail.com', 'a.sacli82@gmail.com', 'demirersezai1@gmail.com');


-- ----------------------------------------------------------------
-- BÖLM 2: Tüm RLS Politikalarını Temizleme ve Yeniden Oluşturma
-- Mevcut tüm karmaşık politikaları silip, basit ve güvenli olanları kurar.
-- ----------------------------------------------------------------

-- Adım 2.1: writer_profiles için mevcut tüm politikaları sil
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.writer_profiles;
DROP POLICY IF EXISTS "Allow public read access to all writer_profiles" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp insert" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp select" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp update" ON public.writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_admin_update" ON public.writer_profiles;
-- Varsa diğerlerini de silmek için genel komutlar
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'writer_profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.writer_profiles;';
    END LOOP;
END$$;


-- Adım 2.2: posts için mevcut tüm politikaları sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.posts;';
    END LOOP;
END$$;

-- Adım 2.3: TEMİZ ve GÜVENLİ writer_profiles politikalarını oluştur
-- Herkes profilleri okuyabilir.
CREATE POLICY "Public can read writer profiles" ON public.writer_profiles FOR SELECT USING (true);
-- Giriş yapmış kullanıcılar kendi profillerini güncelleyebilir.
CREATE POLICY "Users can update their own profile" ON public.writer_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Giriş yapmış kullanıcılar profil oluşturabilir.
CREATE POLICY "Authenticated can insert their profile" ON public.writer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Adım 2.4: TEMİZ ve GÜVENLİ posts politikalarını oluştur
-- Herkes 'published' durumundaki yazıları okuyabilir.
CREATE POLICY "Public can read published posts" ON public.posts FOR SELECT USING (status = 'published');
-- Giriş yapmış kullanıcılar yazı oluşturabilir.
CREATE POLICY "Authenticated can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Yazarlar kendi yazılarını güncelleyebilir.
CREATE POLICY "Authors can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
-- Yazarlar kendi yazılarını silebilir.
CREATE POLICY "Authors can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);


-- ----------------------------------------------------------------
-- BÖLÜM 3: Son Kontrol
-- Düzeltme sonrası kullanıcıların durumunu kontrol et.
-- ----------------------------------------------------------------
SELECT
    'SON KONTROL' as section,
    email,
    raw_user_meta_data ->> 'full_name' as full_name_from_meta,
    raw_user_meta_data ->> 'email' as email_from_meta,
    raw_user_meta_data ->> 'is_approved' as is_approved_from_meta,
    raw_user_meta_data
FROM auth.users
WHERE email IN ('demirersezai@gmail.com', 'gulbahar.semra@hotmail.com', 'inspirationaltechtalks@gmail.com', 'a.sacli82@gmail.com', 'demirersezai1@gmail.com')
ORDER BY email;
