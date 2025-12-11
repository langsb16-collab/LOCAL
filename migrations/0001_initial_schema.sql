-- 지자체 테이블
CREATE TABLE IF NOT EXISTS municipalities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  name_ja TEXT,
  name_vi TEXT,
  name_mn TEXT,
  name_ru TEXT,
  region TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  birth_year INTEGER,
  gender TEXT CHECK(gender IN ('male', 'female', 'other')),
  user_type TEXT CHECK(user_type IN ('senior', 'female', 'disabled', 'general')) NOT NULL,
  disability_type TEXT,
  municipality_id INTEGER,
  preferred_language TEXT DEFAULT 'ko' CHECK(preferred_language IN ('ko', 'en', 'zh', 'ja', 'vi', 'mn', 'ru')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id)
);

-- 일자리 카테고리 테이블
CREATE TABLE IF NOT EXISTS job_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  name_ja TEXT,
  name_vi TEXT,
  name_mn TEXT,
  name_ru TEXT,
  icon TEXT
);

-- 일자리 공고 테이블
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_ko TEXT NOT NULL,
  title_en TEXT,
  title_zh TEXT,
  title_ja TEXT,
  title_vi TEXT,
  title_mn TEXT,
  title_ru TEXT,
  description_ko TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  description_ja TEXT,
  description_vi TEXT,
  description_mn TEXT,
  description_ru TEXT,
  category_id INTEGER,
  municipality_id INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type TEXT CHECK(employment_type IN ('full-time', 'part-time', 'contract', 'temporary')) NOT NULL,
  work_hours TEXT,
  target_type TEXT CHECK(target_type IN ('senior', 'female', 'disabled', 'all')) DEFAULT 'all',
  required_skills TEXT,
  benefits TEXT,
  application_deadline DATE,
  status TEXT CHECK(status IN ('active', 'closed', 'filled')) DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES job_categories(id),
  FOREIGN KEY (municipality_id) REFERENCES municipalities(id)
);

-- 일자리 지원 및 매칭 테이블
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('pending', 'reviewed', 'interviewed', 'accepted', 'rejected')) DEFAULT 'pending',
  cover_letter TEXT,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_municipality ON users(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_jobs_municipality ON jobs(municipality_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_target_type ON jobs(target_type);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
