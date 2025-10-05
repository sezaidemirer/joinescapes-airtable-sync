
-- En çok okunanlar etiketli yazıları kontrol et
SELECT 
    p.id,
    p.title,
    p.status,
    t.name as tag_name,
    t.slug as tag_slug,
    c.name as category_name
FROM posts p
JOIN post_tags pt ON p.id = pt.post_id
JOIN tags t ON pt.tag_id = t.id
JOIN categories c ON p.category_id = c.id
WHERE t.slug IN ('encokokunan', 'en-cok-okunan-haberler', 'en-cok-okunan')
AND p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 10;

