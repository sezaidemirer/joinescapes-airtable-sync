-- TÜM YAZARLARI VE YAZDIKLARI YAZILARI LİSTELE

-- 1. ÖZET: Her yazarın toplam yazı sayısı
SELECT 
    wp.id as writer_id,
    wp.name as yazar_adi,
    wp.email as email,
    wp.title as unvan,
    wp.is_featured as one_cikan,
    wp.profile_image as profil_fotografi,
    au.email as auth_email,
    COUNT(DISTINCT p.id) as toplam_yazi_sayisi,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as yayindaki_yazilar,
    COUNT(DISTINCT CASE WHEN p.status = 'draft' THEN p.id END) as taslak_yazilar,
    COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) as onay_bekleyen_yazilar,
    MAX(p.published_at) as son_yazi_tarihi,
    wp.created_at as kayit_tarihi
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
LEFT JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
GROUP BY wp.id, wp.name, wp.email, wp.title, wp.is_featured, wp.profile_image, au.email, wp.created_at
ORDER BY toplam_yazi_sayisi DESC, wp.name;

-- 2. DETAYLI: Her yazarın tüm yazıları
SELECT 
    wp.id as writer_id,
    wp.name as yazar_adi,
    wp.email as yazar_email,
    wp.title as yazar_unvan,
    p.id as yazi_id,
    p.title as yazi_basligi,
    p.slug as yazi_slug,
    p.status as yazi_durumu,
    p.published_at as yayinlanma_tarihi,
    p.created_at as olusturma_tarihi,
    p.views as goruntuleme,
    p.likes as begenme,
    c.name as kategori,
    p.featured_image_url as gorsel
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
LEFT JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY wp.name, p.created_at DESC;

-- 3. SADECE YAZI YAZAN YAZARLAR (en az 1 yazısı olanlar)
SELECT 
    wp.id as writer_id,
    wp.name as yazar_adi,
    wp.email as email,
    wp.title as unvan,
    au.email as auth_email,
    COUNT(p.id) as yazi_sayisi,
    STRING_AGG(DISTINCT c.name, ', ') as kategoriler,
    MAX(p.published_at) as son_yazi_tarihi
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
INNER JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY wp.id, wp.name, wp.email, wp.title, au.email
HAVING COUNT(p.id) > 0
ORDER BY yazi_sayisi DESC;

-- 4. HİÇ YAZI YAZMAYAN YAZARLAR
SELECT 
    wp.id as writer_id,
    wp.name as yazar_adi,
    wp.email as email,
    wp.title as unvan,
    au.email as auth_email,
    wp.created_at as kayit_tarihi
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
LEFT JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
WHERE p.id IS NULL
ORDER BY wp.created_at DESC;

-- 5. ÖNE ÇIKAN YAZARLAR VE YAZILARI
SELECT 
    wp.id as writer_id,
    wp.name as yazar_adi,
    wp.email as email,
    wp.title as unvan,
    wp.is_featured as one_cikan,
    COUNT(p.id) as yazi_sayisi,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as yayindaki_yazilar
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
LEFT JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
WHERE wp.is_featured = true
GROUP BY wp.id, wp.name, wp.email, wp.title, wp.is_featured
ORDER BY yazi_sayisi DESC;

-- 6. EN ÇOK YAZI YAZAN 10 YAZAR
SELECT 
    wp.name as yazar_adi,
    wp.email as email,
    COUNT(p.id) as toplam_yazi,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as yayinda,
    SUM(p.views) as toplam_goruntulenme,
    SUM(p.likes) as toplam_begenme,
    MAX(p.published_at) as son_yazi_tarihi
FROM writer_profiles wp
LEFT JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
GROUP BY wp.name, wp.email
HAVING COUNT(p.id) > 0
ORDER BY toplam_yazi DESC
LIMIT 10;

-- 7. HER YAZARIN KATEGORİ DAĞILIMI
SELECT 
    wp.name as yazar_adi,
    c.name as kategori,
    COUNT(p.id) as yazi_sayisi,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as yayinda
FROM writer_profiles wp
LEFT JOIN posts p ON (p.author_name = wp.name OR p.author_id = wp.user_id)
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.id IS NOT NULL
GROUP BY wp.name, c.name
ORDER BY wp.name, yazi_sayisi DESC;

