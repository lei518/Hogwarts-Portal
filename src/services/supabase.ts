import { createClient } from "@supabase/supabase-js";
import type { GameState } from "../types/game";
import { hydrateGameState } from "../utils/character";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

export interface CloudProfile {
  displayName: string;
  lastNameChangeAt: string; // ISO timestamp, as returned by Postgres
}

export async function fetchCloudSave(userId: string): Promise<GameState | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("saves")
    .select("game_state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return hydrateGameState((data?.game_state as GameState | undefined) ?? null);
}

export async function upsertCloudSave(userId: string, state: GameState): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("saves")
    .upsert({ user_id: userId, game_state: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<CloudProfile | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .select("display_name, last_name_change_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { displayName: data.display_name, lastNameChangeAt: data.last_name_change_at };
}

export async function createProfile(userId: string, displayName: string): Promise<CloudProfile> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .insert({ user_id: userId, display_name: displayName })
    .select("display_name, last_name_change_at")
    .single();
  if (error) throw error;
  return { displayName: data.display_name, lastNameChangeAt: data.last_name_change_at };
}

// Throws (including on the cooldown trigger firing) — the caller decides how to recover.
export async function updateProfileName(userId: string, newName: string): Promise<CloudProfile> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .update({ display_name: newName })
    .eq("user_id", userId)
    .select("display_name, last_name_change_at")
    .single();
  if (error) throw error;
  return { displayName: data.display_name, lastNameChangeAt: data.last_name_change_at };
}
