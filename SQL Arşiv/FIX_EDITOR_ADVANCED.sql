-- ============================================
-- EDİTÖR + ADMİN POLICY'LERİ - ADVANCED FIX
-- ============================================

-- 1. RLS'yi zorla
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts FORCE ROW LEVEL SECURITY;

-- 2. Varsayılan değerler (eğer kolonlar varsa)
-- ALTER TABLE public.posts ALTER COLUMN status SET DEFAULT 'draft'; -- Gerekirse aktif et

-- 3. Grants - authenticated kullanıcılar select/insert/update yapabilir
GRANT SELECT, INSERT, UPDATE ON public.posts TO authenticated;
REVOKE DELETE ON public.posts FROM authenticated, anon;

-- 4. ESKİ POLICY'LERİ TEMİZLE
DROP POLICY IF EXISTS "posts_select_own_or_published" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_select_all" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_update_all" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_delete_all" ON public.posts;
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone." ON public.posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Public can read published posts OR Admin can read all" ON public.posts;
DROP POLICY IF EXISTS "Authenticated can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts OR Admin can update any" ON public.posts;

-- 5. YENİ POLICY'LER

-- SELECT: Herkes published yazıları görebilir, kullanıcılar kendi yazılarını görebilir
CREATE POLICY "posts_select_published_or_own"
ON public.posts FOR SELECT
TO authenticated
USING (
  status = 'published' 
  OR auth.uid() = author_id
  OR (SELECT raw_user_meta_data->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Anonim kullanıcılar sadece published görebilir
CREATE POLICY "posts_select_published_anon"
ON public.posts FOR SELECT
TO anon
USING (status = 'published');

-- INSERT: Authenticated kullanıcılar kendi author_id'leriyle yazı ekleyebilir
CREATE POLICY "posts_insert_authenticated"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- UPDATE: Kullanıcılar kendi yazılarını veya admin herhangi bir yazıyı güncelleyebilir
CREATE POLICY "posts_update_own_or_admin"
ON public.posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id 
  OR (SELECT raw_user_meta_data->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  auth.uid() = author_id 
  OR (SELECT raw_user_meta_data->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- DELETE: Sadece admin silebilir
CREATE POLICY "posts_delete_admin_only"
ON public.posts FOR DELETE
TO authenticated
USING (
  (SELECT raw_user_meta_data->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- 6. TRIGGER: author_id otomatik doldur (opsiyonel, güvenlik için)
CREATE OR REPLACE FUNCTION public.set_post_author_from_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eğer author_id boşsa, auth.uid()'den al
  IF NEW.author_id IS NULL THEN
    NEW.author_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_set_author ON public.posts;
CREATE TRIGGER trg_posts_set_author
BEFORE INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.set_post_author_from_jwt();

-- 7. Kontrol et
SELECT 
    'Policy Oluşturuldu' as sonuc,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'posts' AND schemaname = 'public'
ORDER BY cmd, policyname;

