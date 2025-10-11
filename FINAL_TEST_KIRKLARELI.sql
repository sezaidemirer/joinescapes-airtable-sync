-- Son Test: Kırklareli yazısının kategorisi

SELECT 
  id,
  title,
  category_id,
  (SELECT name FROM categories WHERE id = posts.category_id) as category_name,
  updated_at
FROM posts
WHERE title LIKE '%Kırklareli%'
ORDER BY updated_at DESC;

-- ✅ Beklenen: category_id = 24 (Kampanyalar ve Fırsatlar)
-- ⚠️ Eğer hala 7 ise, 30 saniye bekle ve tekrar dene!
