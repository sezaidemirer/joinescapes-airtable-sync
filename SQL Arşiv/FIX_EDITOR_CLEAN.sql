-- EDİTÖR YAZI OLUŞTURMA SORUNU - TEMİZ ÇÖZÜM

-- 1. RLS etkinleştir
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts FORCE ROW LEVEL SECURITY;

-- 2. Grants
GRANT SELECT, INSERT, UPDATE ON public.posts TO authenticated;
REVOKE DELETE ON public.posts FROM authenticated, anon;

-- 3. Eski policy'leri temizle
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
DROP POLICY IF EXISTS "posts_select_published_or_own" ON public.posts;
DROP POLICY IF EXISTS "posts_select_published_anon" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_authenticated" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own_or_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_admin_only" ON public.posts;

-- 4. Yeni policy'ler
CREATE POLICY "posts_select_published_or_own"
ON public.posts FOR SELECT
TO authenticated
USING (
  status = 'published' 
  OR auth.uid() = author_id
  OR (SELECT raw_user_meta_data->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "posts_select_published_anon"
ON public.posts FOR SELECT
TO anon
USING (status = 'published');

CREATE POLICY "posts_insert_authenticated"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

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

CREATE POLICY "posts_delete_admin_only"
ON public.posts FOR DELETE
TO authenticated
USING (
  (SELECT raw_user_meta_data->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- 5. Kontrol
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'posts' AND schemaname = 'public'
ORDER BY cmd, policyname;

