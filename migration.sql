-- ============================================================
-- Tech4IT Portfolio — Migration Script
-- ============================================================
-- يُستخدم لتحديث جدول projects الموجود ليطابق السكيما الجديدة
-- آمن للتشغيل المتعدد — يستخدم IF NOT EXISTS و DROP IF EXISTS

-- ============================================================
-- 1. إضافة الأعمدة الناقصة إلى جدول projects
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS description      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft','published','archived')),
  ADD COLUMN IF NOT EXISTS display_order   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_title      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS published_at    TIMESTAMPTZ;

-- تأكد أن details_type يقبل 'custom' أيضاً (الإعداد الافتراضي القديم قد يكون 'readme')
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_details_type_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_details_type_check
  CHECK (details_type IN ('readme', 'custom'));

-- تحديث projects الموجودة: اجعلها منشورة افتراضياً
UPDATE projects SET status = 'published' WHERE status IS NULL OR status = '';

-- ============================================================
-- 2. تحديث الأعمدة الزمنية إلى TIMESTAMPTZ (إن كانت DATE)
-- ============================================================
DO $$
BEGIN
  -- تحويل created_at من DATE إلى TIMESTAMPTZ
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'created_at'
    AND data_type = 'date'
  ) THEN
    ALTER TABLE projects
      ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::TIMESTAMPTZ,
      ALTER COLUMN created_at SET DEFAULT NOW();
  END IF;

  -- تحويل updated_at من DATE إلى TIMESTAMPTZ
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'updated_at'
    AND data_type = 'date'
  ) THEN
    ALTER TABLE projects
      ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::TIMESTAMPTZ,
      ALTER COLUMN updated_at SET DEFAULT NOW();
  END IF;
END $$;

-- ============================================================
-- 3. إضافة أعمدة جديدة لـ contact_messages
-- ============================================================
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- تحويل created_at من TIMESTAMP إلى TIMESTAMPTZ إن لزم
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_messages' AND column_name = 'created_at'
    AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE contact_messages
      ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================
-- 4. إضافة أعمدة جديدة لـ site_settings
-- ============================================================
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS about_text TEXT NOT NULL DEFAULT '';

-- ============================================================
-- 5. فهارس لتحسين الأداء
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_status      ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured    ON projects (featured);
CREATE INDEX IF NOT EXISTS idx_projects_category    ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at  ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_display     ON projects (display_order DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read    ON contact_messages (is_read);

-- ============================================================
-- 6. Triggers (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
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
-- 7. RLS Policies (احذف القديمة وأعد إنشائها)
-- ============================================================
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits           ENABLE ROW LEVEL SECURITY;

-- Projects
DROP POLICY IF EXISTS "Public read projects"            ON projects;
DROP POLICY IF EXISTS "Public read published projects"  ON projects;
DROP POLICY IF EXISTS "Admin all projects"              ON projects;

CREATE POLICY "Public read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin all projects"
  ON projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- Contact messages
DROP POLICY IF EXISTS "Public insert messages"   ON contact_messages;
DROP POLICY IF EXISTS "Admin read messages"      ON contact_messages;
DROP POLICY IF EXISTS "Admin update messages"    ON contact_messages;
DROP POLICY IF EXISTS "Admin delete messages"    ON contact_messages;

CREATE POLICY "Public insert messages"  ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read messages"     ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Admin update messages"   ON contact_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admin delete messages"   ON contact_messages FOR DELETE USING (true);

-- Site settings
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
DROP POLICY IF EXISTS "Admin all settings"   ON site_settings;

CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin all settings"   ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Visits
DROP POLICY IF EXISTS "Public read visits"  ON visits;
DROP POLICY IF EXISTS "Public insert visits" ON visits;
DROP POLICY IF EXISTS "Admin update visits"  ON visits;

CREATE POLICY "Public read visits"   ON visits FOR SELECT USING (true);
CREATE POLICY "Public insert visits" ON visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update visits"  ON visits FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 8. Storage bucket
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
DROP POLICY IF EXISTS "Public upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Public update project images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete project images" ON storage.objects;

CREATE POLICY "Public read project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Public upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Public update project images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Public delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images');

-- ============================================================
-- 9. تحديث قيم موجودة لتطابق السكيما الجديدة
-- ============================================================
-- ضبط details_type = 'custom' للمشاريع التي لا تملك readme_url
UPDATE projects
SET details_type = 'custom'
WHERE details_type = 'readme' AND (readme_url IS NULL OR readme_url = '');

-- ضبط published_at للمشاريع المنشورة التي لا تملكه
UPDATE projects
SET published_at = COALESCE(published_at, created_at, NOW())
WHERE status = 'published' AND published_at IS NULL;

-- ============================================================
-- 10. إصلاح سياسات RLS للسماح بقراءة كل المشاريع من anon
--     (مهم لأن تطبيق الإدارة يستخدم anon key)
-- ============================================================
DROP POLICY IF EXISTS "Public read published projects" ON projects;
DROP POLICY IF EXISTS "Admin all projects"              ON projects;

-- سياسة موحدة: anon يمكنه قراءة وكتابة كل شيء (للوحة الإدارة)
-- في الإنتاج الفعلي، يجب تقييد هذا بالمصادقة
CREATE POLICY "Anon full access projects"
  ON projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- تم! يمكنك التحقق من البنية بـ:
-- \d projects
-- ============================================================
