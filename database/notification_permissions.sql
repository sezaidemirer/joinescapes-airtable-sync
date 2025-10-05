-- Bildirim İzinleri Tablosu
CREATE TABLE IF NOT EXISTS notification_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL CHECK (permission IN ('granted', 'denied', 'default')),
    subscription_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_notification_permissions_user_id ON notification_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_permissions_permission ON notification_permissions(permission);

-- RLS (Row Level Security) aktif et
ALTER TABLE notification_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
-- Kullanıcılar kendi bildirim izinlerini görebilir
CREATE POLICY "Users can view own notification permissions" ON notification_permissions
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi bildirim izinlerini ekleyebilir/güncelleyebilir
CREATE POLICY "Users can insert own notification permissions" ON notification_permissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification permissions" ON notification_permissions
    FOR UPDATE USING (auth.uid() = user_id);

-- Anonim kullanıcılar için özel politika (user_id null olabilir)
CREATE POLICY "Anonymous users can manage notification permissions" ON notification_permissions
    FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

-- Otomatik updated_at güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_permissions_updated_at 
    BEFORE UPDATE ON notification_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Örnek veri (test için)
INSERT INTO notification_permissions (user_id, permission, subscription_data) VALUES
(NULL, 'granted', '{"test": true}'),
(NULL, 'denied', '{"test": true}');
