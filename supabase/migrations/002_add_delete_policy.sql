-- DELETEポリシーとアトミック削除関数を追加
-- 既存のデータベースに対して実行が必要
-- Supabase SQL Editor で実行してください

-- 全員が DELETE 可能（認証不要）
CREATE POLICY IF NOT EXISTS "Allow anonymous deletes" ON likes
  FOR DELETE
  TO anon
  USING (true);

-- アトミックに1件削除する関数（レースコンディション対策）
CREATE OR REPLACE FUNCTION delete_one_like(target_article_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM likes
    WHERE id = (
      SELECT id FROM likes
      WHERE article_id = target_article_id
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
