
-- Fix search_path on increment_balance
CREATE OR REPLACE FUNCTION public.increment_balance(user_row_id uuid, amount integer)
RETURNS void AS $$
  UPDATE profiles SET sulis_balance = COALESCE(sulis_balance, 0) + amount WHERE id = user_row_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Fix search_path on handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Fix search_path on handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;
