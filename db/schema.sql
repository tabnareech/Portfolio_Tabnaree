-- TABNAREE EDUCATION PORTFOLIO — Turso (libSQL/SQLite)
-- works = ผลงาน/เกียรติบัตร/รางวัล (มีระดับ) · news = ข่าวงานประจำวัน (ไม่มีระดับ)
-- จัดหมวด 3 แกนอิสระ: levels (เลือก 1) · work_types (หลายค่า เพิ่มเองได้) · attributes (หลายค่า)
-- วันที่เนื้อหาเก็บเป็น พ.ศ. 'YYYY-MM-DD' เช่น '2569-09-25' (string คงที่ ORDER BY ได้ตรง)
-- ห้ามส่งค่าวันที่เหล่านี้เข้า new Date() ใน JS — ใช้ lib/date.ts เท่านั้น
-- ยกเว้น created_at/updated_at/deleted_at/last_login_at = เวลาระบบ (ค.ศ.) ไม่แสดงผล
-- สื่อใช้คู่ source+ref : drive = Google Drive FILE ID · static = path ใต้ /public
-- updated_at ให้ฝั่ง TypeScript เป็นคนใส่ (ไม่ใช้ trigger)
PRAGMA foreign_keys = ON;
-- ===== 1. ตารางอ้างอิง =====

CREATE TABLE levels (
  code TEXT PRIMARY KEY,
  name_th TEXT NOT NULL,
  short_name TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#1D4ED8',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE attributes (
  code TEXT PRIMARY KEY,
  name_th TEXT NOT NULL,
  short_name TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#16A34A',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE work_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_work_types_slug ON work_types (slug);

-- ===== 2. ข่าวประชาสัมพันธ์ (งานประจำวัน) =====
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NULL,
  activity_type TEXT NOT NULL DEFAULT '',
  event_date TEXT NULL,
  year_be INTEGER NULL,
  location TEXT NOT NULL DEFAULT '',
  cover_source TEXT CHECK(cover_source IN ('drive','static')) NULL,
  cover_ref TEXT NULL,
  video_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  link_label TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  view_count INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('draft','published')) NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT NULL
);

CREATE TABLE news_attributes (
  news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  attribute_code TEXT NOT NULL REFERENCES attributes(code) ON UPDATE CASCADE,
  PRIMARY KEY (news_id, attribute_code)
);

CREATE TABLE news_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  source TEXT CHECK(source IN ('drive','static')) NOT NULL DEFAULT 'drive',
  ref TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  source TEXT CHECK(source IN ('drive','static')) NOT NULL DEFAULT 'drive',
  ref TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== 3. ผลงาน (เกียรติบัตร/รางวัล) =====
CREATE TABLE works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NULL,
  level_code TEXT NOT NULL DEFAULT 'agency' REFERENCES levels(code) ON UPDATE CASCADE,
  awarded_by TEXT NOT NULL DEFAULT '',
  awarded_person TEXT NOT NULL DEFAULT '',
  cert_no TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  work_date TEXT NULL,
  year_be INTEGER NULL,
  location TEXT NOT NULL DEFAULT '',
  cover_source TEXT CHECK(cover_source IN ('drive','static')) NULL,
  cover_ref TEXT NULL,
  video_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  link_label TEXT NOT NULL DEFAULT '',
  related_news_id INTEGER NULL REFERENCES news(id) ON DELETE SET NULL,
  tags TEXT NOT NULL DEFAULT '',
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('draft','published')) NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT NULL
);

CREATE TABLE work_type_links (
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  work_type_id INTEGER NOT NULL REFERENCES work_types(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, work_type_id)
);

CREATE TABLE work_attributes (
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  attribute_code TEXT NOT NULL REFERENCES attributes(code) ON UPDATE CASCADE,
  PRIMARY KEY (work_id, attribute_code)
);

CREATE TABLE work_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  source TEXT CHECK(source IN ('drive','static')) NOT NULL DEFAULT 'drive',
  ref TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  source TEXT CHECK(source IN ('drive','static')) NOT NULL DEFAULT 'drive',
  ref TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- ===== 4. การพัฒนาตนเอง =====

CREATE TABLE self_developments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'อบรม',
  start_date TEXT NULL,
  end_date TEXT NULL,
  year_be INTEGER NULL,
  hours INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  certificate_source TEXT CHECK(certificate_source IN ('drive','static')) NULL,
  certificate_ref TEXT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NULL,
  note TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  link_label TEXT NOT NULL DEFAULT '',
  status TEXT CHECK(status IN ('draft','published')) NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT NULL
);

CREATE TABLE item_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT CHECK(entity_type IN ('self_dev')) NOT NULL,
  entity_id INTEGER NOT NULL,
  source TEXT CHECK(source IN ('drive','static')) NOT NULL DEFAULT 'drive',
  ref TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT CHECK(entity_type IN ('self_dev')) NOT NULL,
  entity_id INTEGER NOT NULL,
  source TEXT CHECK(source IN ('drive','static')) NOT NULL DEFAULT 'drive',
  ref TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== 5. โปรไฟล์ =====
CREATE TABLE profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  academic_standing TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  line_id TEXT NOT NULL DEFAULT '',
  youtube TEXT NOT NULL DEFAULT '',
  footer_link_url TEXT NOT NULL DEFAULT '',
  footer_link_label TEXT NOT NULL DEFAULT '',
  avatar_source TEXT CHECK(avatar_source IN ('drive','static')) NULL,
  avatar_ref TEXT NULL,
  avatar_focus_x INTEGER NOT NULL DEFAULT 50,
  avatar_focus_y INTEGER NOT NULL DEFAULT 35,
  hero_source TEXT CHECK(hero_source IN ('drive','static')) NULL,
  hero_ref TEXT NULL,
  motto TEXT NOT NULL DEFAULT '',
  philosophy TEXT NOT NULL DEFAULT '',
  bio TEXT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE educations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year_be INTEGER NOT NULL,
  degree TEXT NOT NULL,
  institute TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT NULL
);

CREATE TABLE career_paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period TEXT NOT NULL,
  position TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  is_current INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT NULL
);

-- ===== 6. ระบบ/ความปลอดภัย =====
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  last_login_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT '',
  success INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL DEFAULT '',
  record_id INTEGER NULL,
  detail TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== 7. ดัชนี =====
CREATE UNIQUE INDEX uq_users_username ON users (username);
CREATE UNIQUE INDEX uq_works_slug ON works (slug);
CREATE UNIQUE INDEX uq_news_slug ON news (slug);
CREATE INDEX idx_works_level ON works (level_code, status, deleted_at);
CREATE INDEX idx_works_date ON works (work_date DESC);
CREATE INDEX idx_works_year ON works (year_be);
CREATE INDEX idx_works_feat ON works (is_featured, status, deleted_at);
CREATE INDEX idx_wa_work ON work_attributes (work_id);
CREATE INDEX idx_wa_attr ON work_attributes (attribute_code);
CREATE INDEX idx_wtl_work ON work_type_links (work_id);
CREATE INDEX idx_wtl_type ON work_type_links (work_type_id);
CREATE INDEX idx_wi_work ON work_images (work_id, sort_order);
CREATE INDEX idx_wf_work ON work_files (work_id, sort_order);
CREATE INDEX idx_news_date ON news (event_date DESC);
CREATE INDEX idx_news_year ON news (year_be);
CREATE INDEX idx_news_status ON news (status, deleted_at);
CREATE INDEX idx_na_news ON news_attributes (news_id);
CREATE INDEX idx_na_attr ON news_attributes (attribute_code);
CREATE INDEX idx_ni_news ON news_images (news_id, sort_order);
CREATE INDEX idx_nf_news ON news_files (news_id, sort_order);
CREATE INDEX idx_sd_year ON self_developments (year_be, deleted_at);
CREATE INDEX idx_ii_entity ON item_images (entity_type, entity_id, sort_order);
CREATE INDEX idx_if_entity ON item_files (entity_type, entity_id, sort_order);
CREATE INDEX idx_la_ip ON login_attempts (ip, created_at);
