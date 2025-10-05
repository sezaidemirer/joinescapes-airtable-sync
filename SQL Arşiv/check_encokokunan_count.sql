
-- encokokunan etiketli kaç yazı var kontrol et
SELECT 
    COUNT(*) as toplam_yazi,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published_yazi,
    COUNT(CASE WHEN p.status = 'draft' THEN 1 END) as draft_yazi
FROM posts p
JOIN post_tags pt ON p.id = pt.post_id
JOIN tags t ON pt.tag_id = t.id
WHERE t.slug = 'encokokunan';

