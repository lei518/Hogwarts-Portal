// Cross-cutting on purpose: an Objective can originate from Campus Map
// exploration today, and from Academics, Events, House Cup, Assignments,
// Tutorials, or another future system later - see utils/objectives.ts for
// how a system registers its own objectives without the Planner (or Home)
// changing.
export interface Objective {
  id: string;
  title: string;
  description: string;
  source: string; // which system contributed this, e.g. "Campus Map"
  actionPath?: string;
  actionLabel?: string;
}
