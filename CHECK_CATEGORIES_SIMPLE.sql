-- Kategorileri Kontrol Et (Basit Versiyon)

SELECT 
  id,
  title,
  category_id,
  updated_at
FROM posts
WHERE category_id IN (24, 9, 12, 13, 16)
ORDER BY updated_at DESC
LIMIT 10;

