// Account-level data belongs to the authenticated user, not to their character.
// Kept separate so character data (GameContext/Character) never has to
// duplicate anything that already lives here (AuthContext's `user`/`profile`).
export interface Account {
  userId: string;
  email: string | null;
  displayName: string;
  lastNameChangeAt: string; // ISO timestamp
}
