-- ADMİN GİRİŞ SORUNU ÇÖZÜMÜ
-- AMAÇ: Admin kullanıcısının (test@test.com) rolünü doğrulamak ve RLS politikalarını admin yetkilerini içerecek şekilde güncellemek.

-- ----------------------------------------------------------------
-- BÖLÜM 1: Admin Kullanıcısının Kimliğini ve Rolünü Düzeltme
-- ----------------------------------------------------------------
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'user_role', 'admin',
    'email', 'test@test.com' -- Emin olmak için email'i de ekleyelim
)
WHERE email = 'test@test.com';


-- ----------------------------------------------------------------
-- BÖLÜM 2: Admin Yetkileri İçin Bir Yardımcı Fonksiyon Oluşturma
-- RLS politikalarını daha temiz hale getirmek için, bir kullanıcının admin olup olmadığını kontrol eden bir fonksiyon oluşturuyoruz.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
    -- Giriş yapmış kullanıcının JWT (kimlik token'ı) içerisindeki metadata'dan 'user_role' alanını kontrol eder.
    SELECT COALESCE((auth.jwt()->'user_metadata'->>'user_role')::text = 'admin', false)
$$;


-- ----------------------------------------------------------------
-- BÖLÜM 3: Mevcut RLS Politikalarını Silip, Admin Yetkili Olanları Kurma
-- ----------------------------------------------------------------

-- Adım 3.1: Önceki tüm RLS politikalarını TEMİZLE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'writer_profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.writer_profiles;';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.posts;';
    END LOOP;
END$$;


-- Adım 3.2: ADMİN YETKİLİ YENİ writer_profiles politikalarını oluştur
-- Herkes profilleri okuyabilir.
CREATE POLICY "Public can read writer profiles" ON public.writer_profiles FOR SELECT USING (true);
-- Kullanıcılar kendi profilini VEYA admin herhangi bir profili güncelleyebilir.
CREATE POLICY "Users can update own profile OR Admin can update any" ON public.writer_profiles FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
-- Giriş yapmış kullanıcılar profil oluşturabilir.
CREATE POLICY "Authenticated can insert their profile" ON public.writer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admin herhangi bir profili silebilir.
CREATE POLICY "Admin can delete any profile" ON public.writer_profiles FOR DELETE USING (public.is_admin());


-- Adım 3.3: ADMİN YETKİLİ YENİ posts politikalarını oluştur
-- Herkes 'published' yazıları VEYA admin tüm yazıları okuyabilir.
CREATE POLICY "Public can read published posts OR Admin can read all" ON public.posts FOR SELECT USING (status = 'published' OR public.is_admin());
-- Giriş yapmış kullanıcılar yazı oluşturabilir.
CREATE POLICY "Authenticated can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Yazarlar kendi yazılarını VEYA admin herhangi bir yazıyı güncelleyebilir.
CREATE POLICY "Authors can update own posts OR Admin can update any" ON public.posts FOR UPDATE USING (auth.uid() = author_id OR public.is_admin()) WITH CHECK (auth.uid() = author_id OR public.is_admin());
-- Yazarlar kendi yazılarını VEYA admin herhangi bir yazıyı silebilir.
CREATE POLICY "Authors can delete own posts OR Admin can delete any" ON public.posts FOR DELETE USING (auth.uid() = author_id OR public.is_admin());


-- ----------------------------------------------------------------
-- BÖLÜM 4: Son Kontrol
-- ----------------------------------------------------------------
SELECT
    'SON KONTROL' as section,
    email,
    raw_user_meta_data ->> 'user_role' as user_role_from_meta
FROM auth.users
WHERE email = 'test@test.com';
