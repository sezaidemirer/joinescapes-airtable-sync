-- GÜVENLİ FONKSİYON: Onay Bekleyen Editörleri Listele
-- AMAÇ: Admin'in, `auth.users` tablosuna doğrudan erişmeden, güvenli bir şekilde onay bekleyen kullanıcıları listelemesini sağlamak.

-- Adım 1: Önce, varsa eski fonksiyonu sil.
DROP FUNCTION IF EXISTS public.get_pending_editors();

-- Adım 2: Yeni RPC fonksiyonunu oluştur.
CREATE OR REPLACE FUNCTION public.get_pending_editors()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT
)
LANGUAGE plpgsql
-- SECURITY DEFINER: Bu fonksiyonu, onu oluşturan kişinin (yani veritabanı sahibinin) yetkileriyle çalıştırır.
-- Bu sayede normalde erişilemeyen `auth.users` tablosuna güvenli bir şekilde erişebiliriz.
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Sadece admin rolüne sahip kullanıcıların bu fonksiyonu çalıştırabildiğinden emin ol.
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Sadece adminler bu işlemi yapabilir.';
    END IF;

    -- auth.users tablosundan, metadata'sında 'editor_approved' alanı 'false' olan VEYA 'user_role' alanı 'user' olanları seç.
    -- Bu, hem yeni kayıt olmuş hem de henüz editör rolü verilmemiş kullanıcıları kapsar.
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.created_at,
        u.raw_user_meta_data->>'first_name' AS first_name,
        u.raw_user_meta_data->>'last_name' AS last_name,
        u.raw_user_meta_data->>'full_name' AS full_name
    FROM auth.users u
    WHERE 
        (u.raw_user_meta_data->>'editor_approved')::boolean = false
        OR (u.raw_user_meta_data->>'user_role')::text = 'user'
    ORDER BY u.created_at ASC;
END;
$$;

-- Adım 3: Fonksiyonun sahipliğini, süper kullanıcı olan 'postgres' rolüne ver.
-- Bu, SECURITY DEFINER'ın doğru çalışması için kritik bir adımdır.
ALTER FUNCTION public.get_pending_editors() OWNER TO postgres;

-- Adım 4: Giriş yapmış tüm kullanıcıların bu fonksiyonu "çağırma" yetkisine sahip olmasını sağla.
-- Fonksiyonun içindeki 'is_admin()' kontrolü, yetkisiz kullanımı zaten engelleyecektir.
GRANT EXECUTE ON FUNCTION public.get_pending_editors() TO authenticated;


-- KONTROL: Fonksiyonun oluştuğunu doğrula.
SELECT
    'KONTROL' as section,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'get_pending_editors';
