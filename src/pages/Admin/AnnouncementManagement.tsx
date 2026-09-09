import { useMemo, useState, type FormEvent } from "react";
import { Megaphone, PlusSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { announcementsRepository } from "../../repositories/announcementsRepository";
import type { Announcement, AnnouncementType, AnnouncementVisibility } from "../../types/resources";
import { AnnouncementTypeBadge } from "../../components/announcements/AnnouncementTypeBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

const textareaClass =
  "w-full bg-void/40 border border-parchment-dim/25 rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150 focus:border-gold focus:ring-2 focus:ring-gold/15";

const ANNOUNCEMENT_TYPES: AnnouncementType[] = ["General", "Academic", "Campus Event", "Emergency", "Maintenance"];

interface FormState {
  title: string;
  content: string;
  announcementType: AnnouncementType;
  visibility: AnnouncementVisibility;
  courseId: string;
  expiresAt: string;
  publishNow: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  announcementType: "General",
  visibility: "School",
  courseId: "",
  expiresAt: "",
  publishNow: true,
};

// Phase 6 - Communication & Administration System. The Admin authoring
// surface: create/edit/delete/publish/unpublish any announcement, school-
// wide or course-scoped - see CLAUDE.md's Resources section. Reads through
// useAcademicData() (admin's RLS-scoped `announcements` already includes
// every draft from every author, see migration 0007's "view visible
// announcements" policy), same shared source every other role reads from.
export function AnnouncementManagementPage() {
  const { user } = useAuth();
  const { announcements, courses, coursesById, loading, refresh } = useAcademicData();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [announcements]
  );

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading announcements…" />
      </div>
    );
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      content: announcement.content,
      announcementType: announcement.announcementType,
      visibility: announcement.visibility,
      courseId: announcement.courseId ?? "",
      expiresAt: announcement.expiresAt?.slice(0, 10) ?? "",
      publishNow: announcement.published,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !form.title.trim() || !form.content.trim()) return;
    if (form.visibility === "Course" && !form.courseId) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await announcementsRepository.update(editingId, {
          title: form.title.trim(),
          content: form.content.trim(),
          announcementType: form.announcementType,
          visibility: form.visibility,
          courseId: form.visibility === "Course" ? form.courseId : null,
          expiresAt: form.expiresAt || undefined,
        });
      } else {
        await announcementsRepository.create({
          title: form.title.trim(),
          content: form.content.trim(),
          announcementType: form.announcementType,
          visibility: form.visibility,
          courseId: form.visibility === "Course" ? form.courseId : undefined,
          authorUserId: user.id,
          published: form.publishNow,
          expiresAt: form.expiresAt || undefined,
        });
      }
      cancelEdit();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(announcement: Announcement) {
    setActingId(announcement.id);
    try {
      if (announcement.published) {
        await announcementsRepository.unpublish(announcement.id);
      } else {
        await announcementsRepository.publish(announcement.id);
      }
      refresh();
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete(id: string) {
    setActingId(id);
    try {
      await announcementsRepository.remove(id);
      if (editingId === id) cancelEdit();
      refresh();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Announcement Management"
        description="Create, edit, and publish school-wide and course announcements."
        icon={Megaphone}
      />

      {sorted.length === 0 ? (
        <EmptyState message="No announcements have been created yet." icon={Megaphone} />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((announcement) => {
            const course = announcement.courseId ? coursesById.get(announcement.courseId) : undefined;
            return (
              <Card key={announcement.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-display text-lg text-parchment">{announcement.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <AnnouncementTypeBadge type={announcement.announcementType} />
                    <span
                      className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                        announcement.published
                          ? "border-pine/40 text-pine bg-pine/10"
                          : "border-parchment-dim/25 text-parchment-dim"
                      }`}
                    >
                      {announcement.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <p className="text-parchment-dim text-xs mb-2">
                  {announcement.author} &middot; {announcement.visibility === "Course" ? course?.name ?? "Course" : "School-wide"}{" "}
                  &middot; {formatDate(announcement.createdAt)}
                  {announcement.expiresAt && <> &middot; Expires {formatDate(announcement.expiresAt)}</>}
                </p>
                <p className="text-parchment-dim text-sm mb-3">{announcement.content}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(announcement)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actingId === announcement.id}
                    onClick={() => handleTogglePublish(announcement)}
                  >
                    {announcement.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={actingId === announcement.id}
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="px-5 py-5">
        <h2 className="font-display text-parchment text-lg mb-4 flex items-center gap-2">
          <PlusSquare size={17} className="text-gold-bright" /> {editingId ? "Edit Announcement" : "Create Announcement"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Type" htmlFor="announcement-type">
              <Select
                id="announcement-type"
                value={form.announcementType}
                onChange={(e) => setForm({ ...form, announcementType: e.target.value as AnnouncementType })}
              >
                {ANNOUNCEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Visibility" htmlFor="announcement-visibility">
              <Select
                id="announcement-visibility"
                value={form.visibility}
                onChange={(e) =>
                  setForm({ ...form, visibility: e.target.value as AnnouncementVisibility, courseId: "" })
                }
              >
                <option value="School">School-wide</option>
                <option value="Course">Course</option>
              </Select>
            </FormField>
          </div>

          {form.visibility === "Course" && (
            <FormField label="Course" htmlFor="announcement-course">
              <Select
                id="announcement-course"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                required
              >
                <option value="">Choose a course&hellip;</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Title" htmlFor="announcement-title">
            <Input id="announcement-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </FormField>
          <FormField label="Content" htmlFor="announcement-content">
            <textarea
              id="announcement-content"
              className={`${textareaClass} min-h-[100px]`}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Expires (optional)" htmlFor="announcement-expires">
            <Input
              id="announcement-expires"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </FormField>
          {!editingId && (
            <label className="flex items-center gap-2 text-sm text-parchment-dim">
              <input
                type="checkbox"
                checked={form.publishNow}
                onChange={(e) => setForm({ ...form, publishNow: e.target.checked })}
              />
              Publish immediately
            </label>
          )}
          {error && <p className="text-ember text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting} className="self-start">
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Create Announcement"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
