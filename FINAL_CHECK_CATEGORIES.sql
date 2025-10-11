-- Final Kategori Kontrolü
-- Kategorilerin doğru kaydedilip kaydedilmediğini kontrol et

SELECT 
  posts.id,
  posts.title,
  posts.category_id,
  categories.name as category_name,
  posts.updated_at
FROM posts
LEFT JOIN categories ON posts.category_id = categories.id
WHERE 
  posts.title LIKE '%2026 Yurt Dışı%' 
  OR posts.title LIKE '%Havayolu Şirketleri İndirimli%'
  OR posts.category_id IN (24, 9, 12, 13, 16)
ORDER BY posts.updated_at DESC
LIMIT 20;

-- ✅ Beklenen sonuçlar:
-- category_id: 24 → "Kampanyalar ve Fırsatlar"
-- category_id: 9  → "Havayolu Haberleri"
-- category_id: 13 → "Yurt İçi Haberleri"
-- category_id: 12 → "Yurt Dışı Haberleri"
-- category_id: 16 → "Vize ve Seyahat Belgeleri"
