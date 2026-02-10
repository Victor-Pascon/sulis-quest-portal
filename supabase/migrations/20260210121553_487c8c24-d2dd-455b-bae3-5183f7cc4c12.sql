
-- Add goal_id and completed_at to quests
ALTER TABLE quests ADD COLUMN IF NOT EXISTS goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create increment_balance RPC function
CREATE OR REPLACE FUNCTION public.increment_balance(user_row_id uuid, amount integer)
RETURNS void AS $$
  UPDATE profiles SET sulis_balance = COALESCE(sulis_balance, 0) + amount WHERE id = user_row_id;
$$ LANGUAGE sql SECURITY DEFINER;
