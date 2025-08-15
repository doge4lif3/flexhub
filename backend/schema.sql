PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  due_ts INTEGER,           -- unix ms
  energy INTEGER DEFAULT 2, -- 1=low,2=med,3=high
  urgency INTEGER DEFAULT 2,-- 1..3 (AI adjusts)
  created_ts INTEGER,
  done INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_ts INTEGER,
  end_ts INTEGER,
  flexible INTEGER DEFAULT 1, -- can be moved by autoscheduler
  location TEXT,
  created_ts INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  planned_cents INTEGER NOT NULL,
  actual_cents INTEGER DEFAULT 0,
  month TEXT NOT NULL, -- "2025-08"
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exchange_listings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- "have" | "need"
  title TEXT NOT NULL,
  description TEXT,
  created_ts INTEGER,
  status TEXT DEFAULT 'open',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
