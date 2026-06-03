-- ============================================================
-- Tech4IT Portfolio — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to set up the database.
-- The Flutter admin app and this Next.js portfolio share this
-- exact same schema, so you only need to run it once.

-- 0. Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Projects table
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  technologies  TEXT[] NOT NULL DEFAULT '{}',
  cover_image   TEXT NOT NULL DEFAULT '',
  gallery_images TEXT[] NOT NULL DEFAULT '{}',
  readme_url    TEXT NOT NULL DEFAULT '',
  -- Custom details system (admin can write their own markdown)
  details_type  TEXT NOT NULL DEFAULT 'custom' CHECK (details_type IN ('readme', 'custom')),
  custom_details TEXT NOT NULL DEFAULT '',
  custom_images  TEXT[] NOT NULL DEFAULT '{}',
  -- Categorisation & visibility
  category      TEXT NOT NULL DEFAULT 'mobile' CHECK (category IN ('mobile','web','trading','ai','maintenance')),
  featured      BOOLEAN NOT NULL DEFAULT false,
  status        TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  -- SEO
  meta_title       TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  -- Dates
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_status      ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured    ON projects (featured);
CREATE INDEX IF NOT EXISTS idx_projects_category    ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at  ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_display     ON projects (display_order DESC, created_at DESC);

-- ============================================================
-- 2. Contact messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  project_type  TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read    ON contact_messages (is_read);

-- ============================================================
-- 3. Site settings
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name  TEXT NOT NULL DEFAULT 'Tech4IT',
  tagline       TEXT NOT NULL DEFAULT 'Building Modern Software Solutions',
  email         TEXT NOT NULL DEFAULT '',
  whatsapp      TEXT NOT NULL DEFAULT '',
  telegram      TEXT NOT NULL DEFAULT '',
  hero_title    TEXT NOT NULL DEFAULT 'Building Modern Software Solutions',
  hero_subtitle TEXT NOT NULL DEFAULT 'We craft high-performance applications...',
  about_text    TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. Visits counter (daily)
-- ============================================================
CREATE TABLE IF NOT EXISTS visits (
  id            SERIAL PRIMARY KEY,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  count         INTEGER NOT NULL DEFAULT 0,
  UNIQUE(date)
);

-- ============================================================
-- 5. updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at       ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status <> 'published') THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_published_at ON projects;
CREATE TRIGGER set_projects_published_at
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- ============================================================
-- 6. Seed default site settings
-- ============================================================
INSERT INTO site_settings (company_name, tagline, email, whatsapp, telegram, hero_title, hero_subtitle)
VALUES (
  'Tech4IT',
  'Building Modern Software Solutions',
  'fahmifuadalamere@gmail.com',
  '0576701295',
  '@tech4it',
  'Building Modern Software Solutions',
  'We craft high-performance applications, intelligent trading systems, and AI-powered solutions that drive business growth.'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. Row Level Security
-- ============================================================
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published projects" ON projects;
CREATE POLICY "Public read published projects"
  ON projects FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin all projects" ON projects;
CREATE POLICY "Admin all projects"
  ON projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert messages" ON contact_messages;
CREATE POLICY "Public insert messages" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read messages"   ON contact_messages;
CREATE POLICY "Admin read messages"   ON contact_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin update messages" ON contact_messages;
CREATE POLICY "Admin update messages" ON contact_messages FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin delete messages" ON contact_messages;
CREATE POLICY "Admin delete messages" ON contact_messages FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read settings" ON site_settings;
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all settings" ON site_settings;
CREATE POLICY "Admin all settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read visits"  ON visits;
CREATE POLICY "Public read visits"  ON visits FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert visits" ON visits;
CREATE POLICY "Public insert visits" ON visits FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin update visits" ON visits;
CREATE POLICY "Admin update visits" ON visits FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 8. Storage bucket for project images
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public            = EXCLUDED.public,
      file_size_limit   = EXCLUDED.file_size_limit,
      allowed_mime_types= EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read project images"   ON storage.objects;
CREATE POLICY "Public read project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Public upload project images" ON storage.objects;
CREATE POLICY "Public upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Public update project images" ON storage.objects;
CREATE POLICY "Public update project images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Public delete project images" ON storage.objects;
CREATE POLICY "Public delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images');
