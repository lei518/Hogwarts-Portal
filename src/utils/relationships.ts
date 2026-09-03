export type RelationshipLevel =
  | "Stranger"
  | "Acquaintance"
  | "Friendly"
  | "Friend"
  | "Trusted Friend";

export function getRelationshipLevel(value: number): RelationshipLevel {
  if (value >= 81) return "Trusted Friend";
  if (value >= 61) return "Friend";
  if (value >= 41) return "Friendly";
  if (value >= 21) return "Acquaintance";
  return "Stranger";
}
