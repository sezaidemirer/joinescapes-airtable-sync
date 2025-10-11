-- Kırklareli yazısı duplike mi?

SELECT 
  id,
  title,
  slug,
  category_id,
  created_at,
  updated_at
FROM posts
WHERE title LIKE '%Kırklareli%' OR slug LIKE '%kirklareli%'
ORDER BY id;

-- Eğer 2 satır varsa → Duplike var!
