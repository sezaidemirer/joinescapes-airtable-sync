-- Kategorileri Kontrol Et
-- "Kampanyalar ve Fırsatlar" ve "Havayolu Haberleri" kategorisindeki yazıların ID'lerini kontrol et

SELECT 
  id,
  title,
  category_id,
  (SELECT name FROM categories WHERE id = posts.category_id) as category_name,
  updated_at
FROM posts
WHERE title LIKE '%2026 Yurt Dışı%' 
   OR title LIKE '%Havayolu Şirketleri İndirimli%'
ORDER BY updated_at DESC;

-- ✅ Beklenen: 
-- "2026 Yurt Dışı Erken Rezervasyon İle Tatil Fırsatları" → category_id: 24
-- "2026'te Hangi Havayolu Şirketleri İndirimli Bilet Sunuyor?" → category_id: 9

