import { supabase } from "./supabase";

/* ---------- core API ---------- */

// Fetches the profile (cycle data) for the logged-in user
export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') console.error("Profile Error:", error);
  return data;
}

// Updates the profile (cycle length, period start, etc.)
export async function updateUserSettings(updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updates });

  if (error) console.error("Update Error:", error);
}

// Fetches all journal/mood/ritual entries for the user
export async function getJournalHistory() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error("Journal Fetch Error:", error);
  return data || [];
}

/* ---------- feature helpers ---------- */

export async function setMood(mood: string, tags: string[] = []) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('journal_entries').insert({
    user_id: user.id,
    type: 'mood',
    content: mood,
    tags: tags
  });
}

export async function addJournalEntry(content: string, type: 'mood' | 'sakhi' | 'ritual' = 'mood') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('journal_entries').insert({
    user_id: user.id,
    type: type,
    content: content
  });
}

export async function logBreathingSession() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('journal_entries').insert({
    user_id: user.id,
    type: 'ritual',
    content: "Completed a calming breathing ritual 🌙"
  });
}