-- YouTube Videos Table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id VARCHAR(20) NOT NULL UNIQUE, -- YouTube video ID (11 karakter)
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_name TEXT,
  views_count TEXT DEFAULT 'N/A',
  upload_date TEXT DEFAULT 'Yeni',
  duration TEXT DEFAULT 'N/A',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_youtube_videos_video_id ON youtube_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_active ON youtube_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_order ON youtube_videos(display_order);

-- RLS (Row Level Security) - Herkese okuma, sadece authenticated kullanıcılara yazma
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Enable read access for all users" ON youtube_videos
  FOR SELECT USING (true);

-- Authenticated users can insert, update, delete
CREATE POLICY "Enable insert for authenticated users only" ON youtube_videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON youtube_videos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON youtube_videos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_youtube_videos_updated_at
  BEFORE UPDATE ON youtube_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get active videos ordered by display_order
CREATE OR REPLACE FUNCTION get_active_youtube_videos()
RETURNS TABLE (
  id UUID,
  video_id VARCHAR(20),
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  channel_name TEXT,
  views_count TEXT,
  upload_date TEXT,
  duration TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    yv.id,
    yv.video_id,
    yv.title,
    yv.description,
    yv.thumbnail_url,
    yv.channel_name,
    yv.views_count,
    yv.upload_date,
    yv.duration,
    yv.display_order,
    yv.created_at
  FROM youtube_videos yv
  WHERE yv.is_active = true
  ORDER BY yv.display_order ASC, yv.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder videos
CREATE OR REPLACE FUNCTION reorder_youtube_videos(video_ids UUID[])
RETURNS VOID AS $$
DECLARE
  video_id UUID;
  new_order INTEGER := 0;
BEGIN
  FOREACH video_id IN ARRAY video_ids
  LOOP
    UPDATE youtube_videos 
    SET display_order = new_order, updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = video_id;
    new_order := new_order + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default videos if table is empty
INSERT INTO youtube_videos (video_id, title, description, channel_name, views_count, upload_date, display_order)
SELECT * FROM (VALUES
  ('FLNg5aQb9rk', 'Turkish Celebrity in JORDAN! 🇯🇴 جولة شخصية مشهورة في الأردن', 'Join us for an exclusive journey through Jordan with a Turkish celebrity!', 'JoinPRMarketing', '15.2K görüntülenme', '2 gün önce', 0),
  ('pJy_mcZRxDY', 'SHARM EL SHEIKH Egypt 🇪🇬 Ultimate Travel Guide & Hidden Gems', 'Discover the stunning Red Sea paradise of Sharm El Sheikh!', 'JoinPRMarketing', '12.1K görüntülenme', '1 hafta önce', 1),
  ('jA57OToKvAg', 'SHARM EL SHEIKH - Red Sea Paradise 🌊 Egypt Travel Vlog', 'Experience the magical underwater world and pristine beaches.', 'JoinPRMarketing', '8.7K görüntülenme', '2 hafta önce', 2)
) AS default_videos(video_id, title, description, channel_name, views_count, upload_date, display_order)
WHERE NOT EXISTS (SELECT 1 FROM youtube_videos); 