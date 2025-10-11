-- Sadece Kategori 24'ü kontrol et (Kampanyalar ve Fırsatlar)

SELECT 
  id,
  title,
  category_id,
  updated_at
FROM posts
WHERE category_id = 24
ORDER BY updated_at DESC;
