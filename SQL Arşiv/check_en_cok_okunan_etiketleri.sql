SELECT 
    t.name as tag_name,
    t.slug as tag_slug,
    COUNT(pt.post_id) as yazi_sayisi
FROM tags t
LEFT JOIN post_tags pt ON t.id = pt.tag_id
WHERE t.slug IN ('encokokunan', 'en-cok-okunan-haberler', 'en-cok-okunan')
GROUP BY t.id, t.name, t.slug
ORDER BY yazi_sayisi DESC;
