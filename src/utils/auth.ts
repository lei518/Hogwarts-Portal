// Players sign in with a username; Supabase Auth still runs on email
// underneath, so every username deterministically maps to one synthetic
// address at a reserved, unreachable domain. Keeping this in one place
// means the transformation can't drift between sign-up and sign-in.
const SYNTHETIC_EMAIL_DOMAIN = "hogwarts.local";

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

// Lower-cased so "HarryPotter" and "harrypotter" resolve to the same
// account - both for sign-in and for the uniqueness check that falls out
// of auth.users' existing unique constraint on email.
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
}
