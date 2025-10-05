-- KESİN ÇÖZÜM: Çalışan Kullanıcı Metadata'sını Klonlama
-- AMAÇ: Çalışmayan kullanıcıların metadata'sını, çalışan kullanıcınınkiyle BİREBİR AYNI yapmak.

DO $$
DECLARE
    -- Referans (çalışan) kullanıcı
    reference_user_email TEXT := 'demirersezai@gmail.com';
    
    -- Hedef (çalışmayan) kullanıcılar
    target_users_emails TEXT[] := ARRAY['gulbahar.semra@hotmail.com', 'inspirationaltechtalks@gmail.com', 'a.sacli82@gmail.com', 'demirersezai1@gmail.com'];
    
    -- Değişkenler
    target_email TEXT;
    new_metadata JSONB;
    target_user RECORD;
    target_profile RECORD;
    
BEGIN
    -- 1. Hedef kullanıcılar üzerinde döngü başlat
    FOREACH target_email IN ARRAY target_users_emails
    LOOP
        -- Hedef kullanıcının mevcut bilgilerini auth.users ve writer_profiles'tan al
        SELECT * INTO target_user FROM auth.users WHERE email = target_email;
        SELECT * INTO target_profile FROM writer_profiles WHERE user_id = target_user.id;

        -- Eğer hedef kullanıcı bulunursa devam et
        IF FOUND THEN
            -- 2. Referans yapısını kullanarak YENİ metadata'yı BİREBİR oluştur
            -- Çalışan kullanıcıda olmayan (is_approved, role) gibi alanları KESİNLİKLE EKLEME!
            -- Çalışan kullanıcıda olan (approved_at, birth_date) gibi alanları EKLE!
            new_metadata := jsonb_build_object(
                'email', target_user.email,
                'user_role', 'editor', -- Sabit, referanstaki gibi
                'editor_approved', true, -- Sabit, referanstaki gibi
                'first_name', target_profile.first_name,
                'last_name', target_profile.last_name,
                'full_name', target_profile.name,
                'author_name', split_part(target_user.email, '@', 1), -- Referanstaki gibi email'in başı
                'author_title', target_profile.title,
                'profile_image', target_profile.profile_image,
                'bio', target_profile.bio,
                'location', target_profile.location,
                'social_media', target_profile.social_media,
                'specialties', target_profile.specialties,
                'approved_at', '2025-09-28T18:53:05.959Z', -- Referanstaki gibi sahte veri
                'approved_by', 'test@test.com', -- Referanstaki gibi sahte veri
                'birth_date', '' -- Referanstaki gibi boş
            );
            
            -- 3. Hedef kullanıcının metadata'sını GÜNCELLE
            UPDATE auth.users
            SET raw_user_meta_data = new_metadata
            WHERE id = target_user.id;
            
            RAISE NOTICE 'Kullanıcı Klonlandı ve Güncellendi: %', target_email;
        ELSE
            RAISE WARNING 'Hedef kullanıcı bulunamadı: %', target_email;
        END IF;
    END LOOP;
END$$;


-- KONTROL: Güncelleme sonrası metadata'ları karşılaştır
WITH metadata_comparison AS (
    SELECT
        email,
        jsonb_object_keys(raw_user_meta_data) AS meta_key,
        raw_user_meta_data->>jsonb_object_keys(raw_user_meta_data) AS meta_value
    FROM auth.users
    WHERE email IN ('demirersezai@gmail.com', 'gulbahar.semra@hotmail.com')
)
SELECT 
    'SON KONTROL: Metadata Detayları' as section,
    mc.meta_key,
    MAX(CASE WHEN mc.email = 'demirersezai@gmail.com' THEN mc.meta_value ELSE NULL END) AS demirersezai_value,
    MAX(CASE WHEN mc.email = 'gulbahar.semra@hotmail.com' THEN mc.meta_value ELSE NULL END) AS gulbahar_value,
    CASE
        WHEN MAX(CASE WHEN mc.email = 'demirersezai@gmail.com' THEN mc.meta_value ELSE NULL END) IS DISTINCT FROM MAX(CASE WHEN mc.email = 'gulbahar.semra@hotmail.com' THEN mc.meta_value ELSE NULL END)
        THEN '!!! FARK VAR !!!'
        ELSE 'AYNI'
    END as comparison_result
FROM metadata_comparison mc
GROUP BY mc.meta_key
ORDER BY mc.meta_key;
