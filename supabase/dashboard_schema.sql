-- Add gamification fields to profiles
alter table profiles 
add column if not exists sulis_balance integer default 0,
add column if not exists current_streak integer default 0,
add column if not exists last_active_date date default current_date;

-- Create quests table
create table if not exists quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  reward_amount integer default 10,
  is_completed boolean default false,
  category text default 'daily', -- 'daily', 'main', 'side'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Validation
  constraint title_length check (char_length(title) >= 3)
);

-- RLS for Quests
alter table quests enable row level security;

create policy "Users can view their own quests." on quests
  for select using (auth.uid() = user_id);

create policy "Users can insert their own quests." on quests
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own quests." on quests
  for update using (auth.uid() = user_id);

create policy "Users can delete their own quests." on quests
  for delete using (auth.uid() = user_id);
