-- likes テーブル作成
-- Supabase SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（article_id での検索を高速化）
CREATE INDEX IF NOT EXISTS idx_likes_article_id ON likes(article_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 全員が INSERT 可能（認証不要）
CREATE POLICY "Allow anonymous inserts" ON likes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 全員が SELECT 可能（認証不要）
CREATE POLICY "Allow anonymous selects" ON likes
  FOR SELECT
  TO anon
  USING (true);
