-- 达人短视频分发 APP - SQLite 表结构
-- 三端独立账号、视频（露脸/讲解）、任务、领取、兼职绑定、积分

-- 用户表（三端共用表，用 role 区分）
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','client','influencer')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- 视频表（含类型：露脸 face / 讲解 explain）
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  video_type TEXT NOT NULL DEFAULT 'explain' CHECK(video_type IN ('face','explain')),
  video_link TEXT,
  cloud_url TEXT,
  file_storage TEXT,
  file_key TEXT,
  streaming_code TEXT,
  ai_analysis TEXT,
  order_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  file_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 任务表（达人端可领取）
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_type TEXT NOT NULL,
  video_download_link TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 任务领取记录（每日上限用）
CREATE TABLE IF NOT EXISTS task_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  task_id INTEGER NOT NULL,
  claimed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX IF NOT EXISTS idx_task_claims_user_date ON task_claims(user_id, date(claimed_at));

-- 客户-达人一对一绑定（兼职绑定）
CREATE TABLE IF NOT EXISTS client_influencer_bindings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_code TEXT NOT NULL,
  influencer_code TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 积分账户（按用户）
CREATE TABLE IF NOT EXISTS points_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  role TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 审计日志（关键操作记录：登录、领取、上传、下载、管理操作）
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  role TEXT,
  action TEXT NOT NULL,
  method TEXT,
  path TEXT,
  ip TEXT,
  user_agent TEXT,
  detail TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 管理员权限（细粒度权限）
CREATE TABLE IF NOT EXISTS admin_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  perm TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, perm),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_user ON admin_permissions(user_id);

-- Refresh Token 存储（用于续期与登出失效）
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  issued_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, role);

-- Access Token 撤销列表（登出/风控时使 access token 立即失效）
CREATE TABLE IF NOT EXISTS revoked_access_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jti TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  role TEXT,
  expires_at TEXT NOT NULL,
  revoked_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_revoked_access_tokens_expires ON revoked_access_tokens(expires_at);

-- 投稿/审核闭环
CREATE TABLE IF NOT EXISTS video_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  influencer_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  submitted_at TEXT DEFAULT (datetime('now')),
  reviewed_by INTEGER,
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (influencer_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES videos(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_video_submissions_status ON video_submissions(status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_video_submissions_influencer ON video_submissions(influencer_id, submitted_at);

-- 积分流水（可回溯）
CREATE TABLE IF NOT EXISTS points_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON points_ledger(user_id, created_at);

-- 下载记录（可回溯/风控）
CREATE TABLE IF NOT EXISTS download_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  video_id INTEGER,
  download_type TEXT NOT NULL CHECK(download_type IN ('face','explain')),
  cost_points INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES videos(id)
);

CREATE INDEX IF NOT EXISTS idx_download_records_client ON download_records(client_id, created_at);
