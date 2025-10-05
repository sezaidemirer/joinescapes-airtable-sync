
-- encokokunan etiketli yazıların detayını gör
SELECT 
    p.id,
    p.title,
    p.status,
    p.published_at,
    c.name as category_name
FROM posts p
JOIN post_tags pt ON p.id = pt.post_id
JOIN tags t ON pt.tag_id = t.id
JOIN categories c ON p.category_id = c.id
WHERE t.slug = 'encokokunan'
ORDER BY p.published_at DESC;

