-- Kategori 24 ve 9'u kontrol et

SELECT 
  id,
  title,
  category_id,
  CASE 
    WHEN category_id = 24 THEN 'Kampanyalar ve Fırsatlar'
    WHEN category_id = 9 THEN 'Havayolu Haberleri'
    ELSE 'Diğer'
  END as kategori_adi,
  updated_at
FROM posts
WHERE category_id IN (24, 9)
ORDER BY category_id, updated_at DESC;
