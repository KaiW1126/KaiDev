-- SECURITY DEFINER 関数の参照先を固定し、一時スキーマを最後に探索する。
ALTER FUNCTION public.delete_one_like(TEXT) SET search_path = public, pg_temp;
