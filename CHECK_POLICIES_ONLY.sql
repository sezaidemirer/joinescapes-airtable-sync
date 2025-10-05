-- Sadece mevcut UPDATE policy'lerini kontrol et

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as "using_clause",
    with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';
