import { useState, type FormEvent } from "react";
import { Gift } from "lucide-react";
import { academicCalendar, calendarEventCategories } from "../../data/academicCalendar";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import type { CalendarDraft } from "../../types/adminPortal";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";
const labelClass = "text-parchment-dim text-[11px] uppercase tracking-wide mb-1 block";

const emptyForm = { title: "", date: "", category: calendarEventCategories[0], description: "" };

// Top section is a review of Resources' existing, real Academic Calendar
// (data/academicCalendar.ts) - untouched, read-only. Drafting/publishing
// below is an entirely separate, local-only ledger (AdminContext's
// calendarDrafts) - publishing a draft only ever flips its own status, it
// never writes into academicCalendar.ts. See CLAUDE.md's Admin Portal
// section.
//
// Authentication Foundation (Phase 6C): routed through useAdminScope(),
// the single hook every Admin page uses - calendar drafts are still
// shared/global (unchanged).
export function CalendarManagementPage() {
  const events = [...academicCalendar].sort((a, b) => a.date.localeCompare(b.date));
  const {
    calendarDrafts,
    createCalendarDraft,
    updateCalendarDraft,
    deleteCalendarDraft,
    publishCalendarDraft,
    loading,
  } = useAdminScope();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CalendarDraft, "id" | "status">>(emptyForm);

  function startEdit(draft: CalendarDraft) {
    setEditingId(draft.id);
    setForm({ title: draft.title, date: draft.date, category: draft.category, description: draft.description });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.date) return;

    if (editingId) {
      updateCalendarDraft(editingId, form);
    } else {
      createCalendarDraft(form);
    }
    resetForm();
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading calendar drafts…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🗓️ Calendar Management</h1>
        <p className="text-parchment-dim text-sm">{events.length} events on the Academic Calendar.</p>
      </div>

      <div className="flex flex-col gap-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between gap-3 border border-parchment-dim/20 rounded-sm px-5 py-4">
            <div className="min-w-0">
              <p className="text-parchment truncate">{event.title}</p>
              <p className="text-parchment-dim text-xs">{formatDate(event.date)}</p>
            </div>
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-parchment-dim/25 text-parchment-dim shrink-0">
              {event.category}
            </span>
          </div>
        ))}
      </div>

      <ProfileSection title="Draft Events">
        <div className="flex flex-col gap-2 mb-4">
          {calendarDrafts.length === 0 ? (
            <p className="text-parchment-dim text-sm">No draft events yet.</p>
          ) : (
            calendarDrafts.map((draft) => (
              <div key={draft.id} className="border border-parchment-dim/10 rounded-sm px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-parchment text-sm">{draft.title}</p>
                  <span
                    className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                      draft.status === "Published"
                        ? "border-[#6b9e6b66] text-[#6b9e6b] bg-[#6b9e6b15]"
                        : "border-parchment-dim/25 text-parchment-dim"
                    }`}
                  >
                    {draft.status}
                  </span>
                </div>
                <p className="text-parchment-dim text-xs mb-2">
                  {formatDate(draft.date)} &middot; {draft.category}
                  {draft.description ? ` · ${draft.description}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {draft.status === "Draft" && (
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => publishCalendarDraft(draft.id)}>
                      Publish
                    </Button>
                  )}
                  <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => startEdit(draft)}>
                    Edit
                  </Button>
                  <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => deleteCalendarDraft(draft.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-parchment-dim/10 pt-4">
          <p className="text-parchment-dim text-xs uppercase tracking-wide">
            {editingId ? "Edit Draft" : "New Draft Event"}
          </p>
          <div>
            <label className={labelClass} htmlFor="draft-title">Title</label>
            <input
              id="draft-title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="draft-date">Date</label>
              <input
                id="draft-date"
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="draft-category">Category</label>
              <select
                id="draft-category"
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as CalendarDraft["category"] })}
              >
                {calendarEventCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="draft-description">Description</label>
            <input
              id="draft-description"
              className={inputClass}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">{editingId ? "Save Changes" : "Create Draft"}</Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </ProfileSection>

      <ProfileSection title="Holiday Templates" icon={Gift}>
        <p className="text-parchment-dim text-sm">
          Reusable term/holiday date templates for next year will be available here in a future milestone.
        </p>
      </ProfileSection>
    </div>
  );
}
