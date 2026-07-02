-- profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  date_of_birth date,
  weight_kg numeric,
  height_cm numeric,
  fitness_level text check (fitness_level in ('beginner','intermediate','advanced')),
  goals text[],
  health_notes text,
  created_at timestamptz default now()
);

-- workout_plans table
create table workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  week_number integer not null,
  is_holiday_mode boolean default false,
  days_per_week integer,
  session_length_minutes integer,
  equipment text[],
  gemini_raw_plan jsonb,
  created_at timestamptz default now()
);

-- sessions table
create table sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references workout_plans(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  day_label text,
  focus text,
  exercises jsonb,
  completed boolean default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- chat_messages table
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- enable RLS on all tables
alter table profiles enable row level security;
alter table workout_plans enable row level security;
alter table sessions enable row level security;
alter table chat_messages enable row level security;

-- RLS policies (users can only access their own data)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can manage own plans" on workout_plans for all using (auth.uid() = user_id);
create policy "Users can manage own sessions" on sessions for all using (auth.uid() = user_id);
create policy "Users can manage own messages" on chat_messages for all using (auth.uid() = user_id);

-- trigger to create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
