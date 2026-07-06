-- Store user-supplied AI API key, encrypted at rest by Supabase Vault
-- Falls back to app-level env key when null
alter table profiles
  add column if not exists ai_provider text check (ai_provider in ('gemini','openai','anthropic')) default null,
  add column if not exists ai_api_key text default null;

-- RLS: users can only read/write their own key
create policy "users manage own api key"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
