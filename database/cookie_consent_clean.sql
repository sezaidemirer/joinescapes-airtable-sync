-- Cookie Consent Tracking System
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Çerez onayları tablosu oluştur
CREATE TABLE IF NOT EXISTS cookie_consents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Çerez kategorileri
    necessary BOOLEAN DEFAULT TRUE,
    analytics BOOLEAN DEFAULT FALSE,
    marketing BOOLEAN DEFAULT FALSE,
    personalization BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    consent_method VARCHAR(50) DEFAULT 'banner',
    browser_fingerprint VARCHAR(255),
    
    -- Timestamps
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
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

CREATE POLICY "Users can view their own cookie consents" ON cookie_consents
    FOR SELECT USING (
        auth.uid() = user_id 
        OR session_id IS NOT NULL 
        OR ip_address IS NOT NULL
    );

CREATE POLICY "Anyone can insert cookie consent" ON cookie_consents
    FOR INSERT WITH CHECK (true);

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
    SELECT id INTO existing_consent_id
    FROM cookie_consents
    WHERE 
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
        OR (auth.uid() IS NULL AND session_id = p_session_id)
    ORDER BY consented_at DESC
    LIMIT 1;

    IF existing_consent_id IS NOT NULL THEN
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
    rejected_all BIGINT,
    consent_rate_analytics NUMERIC,
    consent_rate_marketing NUMERIC,
    consent_rate_personalization NUMERIC,
    daily_consents JSON,
    browser_stats JSON,
    method_stats JSON
) AS $$
DECLARE
    total_count BIGINT;
    start_filter DATE;
    end_filter DATE;
BEGIN
    start_filter := COALESCE(start_date, CURRENT_DATE - INTERVAL '30 days');
    end_filter := COALESCE(end_date, CURRENT_DATE);

    SELECT COUNT(*) INTO total_count
    FROM cookie_consents 
    WHERE DATE(consented_at) >= start_filter 
    AND DATE(consented_at) <= end_filter;

    IF total_count = 0 THEN
        RETURN QUERY SELECT 
            0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT,
            0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
            '[]'::JSON, '[]'::JSON, '[]'::JSON;
        RETURN;
    END IF;

    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE analytics = true AND marketing = true AND personalization = true) as all_accepted,
            COUNT(*) FILTER (WHERE analytics = true) as analytics_accepted,
            COUNT(*) FILTER (WHERE marketing = true) as marketing_accepted,
            COUNT(*) FILTER (WHERE personalization = true) as personalization_accepted,
            COUNT(*) FILTER (WHERE analytics = false AND marketing = false AND personalization = false) as all_rejected
        FROM cookie_consents 
        WHERE DATE(consented_at) >= start_filter 
        AND DATE(consented_at) <= end_filter
    ),
    daily_data AS (
        SELECT json_agg(
            json_build_object(
                'date', consent_date,
                'count', daily_count
            ) ORDER BY consent_date
        ) as daily_json
        FROM (
            SELECT 
                DATE(consented_at) as consent_date,
                COUNT(*) as daily_count
            FROM cookie_consents
            WHERE DATE(consented_at) >= start_filter 
            AND DATE(consented_at) <= end_filter
            GROUP BY DATE(consented_at)
            ORDER BY DATE(consented_at)
        ) daily_counts
    ),
    browser_data AS (
        SELECT json_agg(
            json_build_object(
                'browser', COALESCE(
                    CASE 
                        WHEN user_agent ILIKE '%Chrome%' THEN 'Chrome'
                        WHEN user_agent ILIKE '%Firefox%' THEN 'Firefox'
                        WHEN user_agent ILIKE '%Safari%' THEN 'Safari'
                        WHEN user_agent ILIKE '%Edge%' THEN 'Edge'
                        ELSE 'Other'
                    END, 
                    'Unknown'
                ),
                'count', browser_count
            )
        ) as browser_json
        FROM (
            SELECT 
                CASE 
                    WHEN user_agent ILIKE '%Chrome%' THEN 'Chrome'
                    WHEN user_agent ILIKE '%Firefox%' THEN 'Firefox'
                    WHEN user_agent ILIKE '%Safari%' THEN 'Safari'
                    WHEN user_agent ILIKE '%Edge%' THEN 'Edge'
                    ELSE 'Other'
                END as browser_name,
                COUNT(*) as browser_count
            FROM cookie_consents
            WHERE DATE(consented_at) >= start_filter 
            AND DATE(consented_at) <= end_filter
            GROUP BY browser_name
        ) browser_counts
    ),
    method_data AS (
        SELECT json_agg(
            json_build_object(
                'method', consent_method,
                'count', method_count
            )
        ) as method_json
        FROM (
            SELECT 
                COALESCE(consent_method, 'unknown') as consent_method,
                COUNT(*) as method_count
            FROM cookie_consents
            WHERE DATE(consented_at) >= start_filter 
            AND DATE(consented_at) <= end_filter
            GROUP BY consent_method
        ) method_counts
    )
    SELECT 
        s.total,
        s.all_accepted,
        s.analytics_accepted,
        s.marketing_accepted,
        s.personalization_accepted,
        s.all_rejected,
        ROUND((s.analytics_accepted::NUMERIC / s.total::NUMERIC * 100), 2),
        ROUND((s.marketing_accepted::NUMERIC / s.total::NUMERIC * 100), 2),
        ROUND((s.personalization_accepted::NUMERIC / s.total::NUMERIC * 100), 2),
        COALESCE(dd.daily_json, '[]'::JSON),
        COALESCE(bd.browser_json, '[]'::JSON),
        COALESCE(md.method_json, '[]'::JSON)
    FROM stats s
    CROSS JOIN daily_data dd
    CROSS JOIN browser_data bd
    CROSS JOIN method_data md;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expired consents cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_consents()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cookie_consents 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for latest consents
CREATE OR REPLACE VIEW latest_cookie_consents AS
SELECT 
    cc.*,
    CASE 
        WHEN cc.user_id IS NOT NULL AND u.email IS NOT NULL 
        THEN u.email 
        ELSE 'Anonymous User' 
    END as user_email,
    CASE 
        WHEN cc.expires_at < NOW() THEN true 
        ELSE false 
    END as is_expired
FROM cookie_consents cc
LEFT JOIN auth.users u ON cc.user_id = u.id
ORDER BY cc.consented_at DESC; 