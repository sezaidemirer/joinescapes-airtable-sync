-- Kullanıcı ID'sini email ile bulma fonksiyonu
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS TABLE(user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT auth.users.id
  FROM auth.users
  WHERE auth.users.email = user_email;
END;
$$;

-- Fonksiyonu test et
SELECT * FROM get_user_id_by_email('joinprmarketing@gmail.com');
