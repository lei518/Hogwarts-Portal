import { useState, type FormEvent } from "react";
import { CalendarDays, Gift } from "lucide-react";
import { academicCalendar, calendarEventCategories } from "../../data/academicCalendar";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from "../../components/ui/Table";
import type { CalendarDraft } from "../../types/adminPortal";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

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
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Calendar Management"
        description={`${events.length} events on the Academic Calendar.`}
        icon={CalendarDays}
      />

      <Table>
        <Thead>
          <Tr>
            <Th>Event</Th>
            <Th>Date</Th>
            <Th>Category</Th>
          </Tr>
        </Thead>
        <Tbody>
          {events.map((event) => (
            <Tr key={event.id}>
              <Td className="text-parchment">{event.title}</Td>
              <Td className="text-parchment-dim">{formatDate(event.date)}</Td>
              <Td>
                <Badge>{event.category}</Badge>
              </Td>
            </Tr>
          ))}
          {events.length === 0 && <TableEmptyRow colSpan={3}>No events on the Academic Calendar.</TableEmptyRow>}
        </Tbody>
      </Table>

      <ProfileSection title="Draft Events">
        <div className="flex flex-col gap-3 mb-5">
          {calendarDrafts.length === 0 ? (
            <p className="text-parchment-dim text-sm">No draft events yet.</p>
          ) : (
            calendarDrafts.map((draft) => (
              <div key={draft.id} className="border border-parchment-dim/15 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-parchment text-sm">{draft.title}</p>
                  <Badge tone={draft.status === "Published" ? "emerald" : "neutral"}>{draft.status}</Badge>
                </div>
                <p className="text-parchment-dim text-xs mb-2">
                  {formatDate(draft.date)} &middot; {draft.category}
                  {draft.description ? ` · ${draft.description}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {draft.status === "Draft" && (
                    <Button variant="secondary" size="sm" onClick={() => publishCalendarDraft(draft.id)}>
                      Publish
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => startEdit(draft)}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => deleteCalendarDraft(draft.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-parchment-dim/10 pt-5">
          <p className="text-parchment-dim text-xs uppercase tracking-wide">
            {editingId ? "Edit Draft" : "New Draft Event"}
          </p>
          <FormField label="Title" htmlFor="draft-title">
            <Input
              id="draft-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Date" htmlFor="draft-date">
              <Input
                id="draft-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Category" htmlFor="draft-category">
              <Select
                id="draft-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as CalendarDraft["category"] })}
              >
                {calendarEventCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Description" htmlFor="draft-description" helperText="Optional">
            <Input
              id="draft-description"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
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
        <p className="text-parchment-dim text-sm">Reusable term and holiday dates, ready for next year's calendar.</p>
      </ProfileSection>
    </div>
  );
}
