-- Cookie Consent Tracking System
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Çerez onayları tablosu oluştur
CREATE TABLE IF NOT EXISTS cookie_consents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Null olabilir (anonymous users için)
    session_id VARCHAR(255), -- Anonymous users için session tracking
    ip_address INET, -- IP tabanlı tracking
    user_agent TEXT, -- Browser bilgisi
    
    -- Çerez kategorileri
    necessary BOOLEAN DEFAULT TRUE, -- Her zaman true
    analytics BOOLEAN DEFAULT FALSE,
    marketing BOOLEAN DEFAULT FALSE,
    personalization BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    consent_method VARCHAR(50) DEFAULT 'banner', -- 'banner', 'settings', 'api'
    browser_fingerprint VARCHAR(255), -- Browser fingerprint (opsiyonel)
    
    -- Timestamps
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Onayın geçerlik süresi (1 yıl)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Compliance fields
    gdpr_applicable BOOLEAN DEFAULT FALSE,
    kvkk_applicable BOOLEAN DEFAULT TRUE,
    privacy_policy_version VARCHAR(20) DEFAULT '1.0',
    cookie_policy_version VARCHAR(20) DEFAULT '1.0'
);

-- 2. İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_cookie_consents_user_id ON cookie_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_session_id ON cookie_consents(session_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_ip_address ON cookie_consents(ip_address);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_consented_at ON cookie_consents(consented_at DESC);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_expires_at ON cookie_consents(expires_at);

-- 3. RLS politikaları
ALTER TABLE cookie_consents ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi onaylarını görebilir
CREATE POLICY "Users can view their own cookie consents" ON cookie_consents
    FOR SELECT USING (
        auth.uid() = user_id 
        OR session_id IS NOT NULL 
        OR ip_address IS NOT NULL
    );

-- Herkes kendi onayını ekleyebilir
CREATE POLICY "Anyone can insert cookie consent" ON cookie_consents
    FOR INSERT WITH CHECK (true);

-- Kullanıcılar kendi onaylarını güncelleyebilir
CREATE POLICY "Users can update their own cookie consents" ON cookie_consents
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR session_id IS NOT NULL 
        OR ip_address IS NOT NULL
    );

-- 4. Otomatik expires_at ayarlama trigger'ı
CREATE OR REPLACE FUNCTION set_cookie_consent_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- 1 yıl sonra expire olsun
    NEW.expires_at = NEW.consented_at + INTERVAL '1 year';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cookie_consent_expiry_trigger
    BEFORE INSERT ON cookie_consents
    FOR EACH ROW EXECUTE FUNCTION set_cookie_consent_expiry();

-- 5. Updated_at trigger'ı
CREATE OR REPLACE FUNCTION update_cookie_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cookie_consent_updated_at_trigger
    BEFORE UPDATE ON cookie_consents
    FOR EACH ROW EXECUTE FUNCTION update_cookie_consent_updated_at();

-- 6. RPC Functions

-- Kullanıcının son onayını getir
CREATE OR REPLACE FUNCTION get_user_cookie_consent(user_session_id TEXT DEFAULT NULL)
RETURNS TABLE (
    id BIGINT,
    necessary BOOLEAN,
    analytics BOOLEAN,
    marketing BOOLEAN,
    personalization BOOLEAN,
    consented_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_expired BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id,
        cc.necessary,
        cc.analytics,
        cc.marketing,
        cc.personalization,
        cc.consented_at,
        cc.expires_at,
        (cc.expires_at < NOW()) as is_expired
    FROM cookie_consents cc
    WHERE 
        (auth.uid() IS NOT NULL AND cc.user_id = auth.uid()) 
        OR (auth.uid() IS NULL AND cc.session_id = user_session_id)
    ORDER BY cc.consented_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni onay kaydet veya güncelle
CREATE OR REPLACE FUNCTION save_cookie_consent(
    p_session_id TEXT,
    p_necessary BOOLEAN DEFAULT TRUE,
    p_analytics BOOLEAN DEFAULT FALSE,
    p_marketing BOOLEAN DEFAULT FALSE,
    p_personalization BOOLEAN DEFAULT FALSE,
    p_consent_method TEXT DEFAULT 'banner',
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    consent_id BIGINT;
    existing_consent_id BIGINT;
BEGIN
    -- Mevcut onayı kontrol et
    SELECT id INTO existing_consent_id
    FROM cookie_consents
    WHERE 
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
        OR (auth.uid() IS NULL AND session_id = p_session_id)
    ORDER BY consented_at DESC
    LIMIT 1;

    IF existing_consent_id IS NOT NULL THEN
        -- Mevcut onayı güncelle
        UPDATE cookie_consents SET
            necessary = p_necessary,
            analytics = p_analytics,
            marketing = p_marketing,
            personalization = p_personalization,
            consent_method = p_consent_method,
            user_agent = p_user_agent,
            ip_address = p_ip_address,
            updated_at = NOW()
        WHERE id = existing_consent_id
        RETURNING id INTO consent_id;
    ELSE
        -- Yeni onay ekle
        INSERT INTO cookie_consents (
            user_id,
            session_id,
            necessary,
            analytics,
            marketing,
            personalization,
            consent_method,
            user_agent,
            ip_address
        ) VALUES (
            auth.uid(),
            p_session_id,
            p_necessary,
            p_analytics,
            p_marketing,
            p_personalization,
            p_consent_method,
            p_user_agent,
            p_ip_address
        )
        RETURNING id INTO consent_id;
    END IF;

    RETURN consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analytics için onay istatistikleri
CREATE OR REPLACE FUNCTION get_consent_analytics(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_consents BIGINT,
    accepted_all BIGINT,
    accepted_analytics BIGINT,
    accepted_marketing BIGINT,
    accepted_personalization BIGINT,
    only_necessary BIGINT,
    avg_categories_per_user NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_consents,
        COUNT(*) FILTER (WHERE analytics AND marketing AND personalization) as accepted_all,
        COUNT(*) FILTER (WHERE analytics) as accepted_analytics,
        COUNT(*) FILTER (WHERE marketing) as accepted_marketing,
        COUNT(*) FILTER (WHERE personalization) as accepted_personalization,
        COUNT(*) FILTER (WHERE NOT analytics AND NOT marketing AND NOT personalization) as only_necessary,
        ROUND(
            (COUNT(*) FILTER (WHERE analytics)::NUMERIC + 
             COUNT(*) FILTER (WHERE marketing)::NUMERIC + 
             COUNT(*) FILTER (WHERE personalization)::NUMERIC) / 
            NULLIF(COUNT(*)::NUMERIC, 0), 2
        ) as avg_categories_per_user
    FROM cookie_consents
    WHERE 
        (start_date IS NULL OR consented_at::DATE >= start_date)
        AND (end_date IS NULL OR consented_at::DATE <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View - son onaylar
CREATE OR REPLACE VIEW latest_cookie_consents AS
SELECT DISTINCT ON (COALESCE(user_id::TEXT, session_id)) *
FROM cookie_consents
ORDER BY COALESCE(user_id::TEXT, session_id), consented_at DESC; 