// Production Hardening (Phase 6) - the one shared loading affordance for
// every page that reads a Context's `loading` flag (ProfessorAssignments,
// ProfessorGrades, Admin - see each Context's own Phase 5B comment on why
// that flag exists). Reuses the exact empty-state card pattern already
// used throughout the app (e.g. Assignments.tsx's "No assignments have
// been posted yet.") rather than inventing a spinner or a new visual
// language - simple text, same card shell, no layout shift.
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-lg px-5 py-10 text-center animate-fade-in">
      {label}
    </p>
  );
}
