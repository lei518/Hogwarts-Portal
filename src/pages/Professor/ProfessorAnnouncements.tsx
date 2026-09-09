import { useMemo, useState, type FormEvent } from "react";
import { Megaphone, PlusSquare } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { useAcademicData } from "../../context/AcademicDataContext";
import { announcementsRepository } from "../../repositories/announcementsRepository";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";
import { AnnouncementTypeBadge } from "../../components/announcements/AnnouncementTypeBadge";
import type { Announcement, AnnouncementType } from "../../types/resources";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

const textareaClass =
  "w-full bg-void/40 border border-parchment-dim/25 rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150 focus:border-gold focus:ring-2 focus:ring-gold/15";

const ANNOUNCEMENT_TYPES: AnnouncementType[] = ["General", "Academic", "Campus Event", "Emergency", "Maintenance"];

// Phase 6 - Communication & Administration System. Canonical owner of this
// professor's own Course Announcements - real CRUD now, replacing the old
// read-only page's "authoring not available yet" placeholder cards. A
// professor can only ever create Course-scoped rows for a course they
// teach (RLS enforces this server-side too - see migration 0007), never
// School-wide, per CLAUDE.md's Professor Portal section and the Phase 6
// permissions rule.
export function ProfessorAnnouncementsPage() {
  const { professorId, teachingCourses, loading: scopeLoading } = useProfessorScope();
  const { announcements, coursesById, loading: dataLoading, refresh } = useAcademicData();

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("General");
  const [publishNow, setPublishNow] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const myAnnouncements = useMemo(
    () =>
      [...announcements]
        .filter((a) => a.authorUserId === professorId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [announcements, professorId]
  );

  if (scopeLoading || dataLoading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading your announcements…" />
      </div>
    );
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!professorId || !courseId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await announcementsRepository.create({
        title: title.trim(),
        content: content.trim(),
        announcementType,
        visibility: "Course",
        courseId,
        authorUserId: professorId,
        published: publishNow,
        expiresAt: expiresAt || undefined,
      });
      setTitle("");
      setContent("");
      setAnnouncementType("General");
      setExpiresAt("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create this announcement.");
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
      refresh();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Course Announcements"
        description="Notices you've posted to your students."
        icon={Megaphone}
      />

      {myAnnouncements.length === 0 ? (
        <EmptyState message="No announcements yet." icon={Megaphone} />
      ) : (
        <div className="flex flex-col gap-2">
          {myAnnouncements.map((announcement) => {
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
                  {course?.name ?? "Unknown Course"} &middot; {formatDate(announcement.createdAt)}
                </p>
                <p className="text-parchment-dim text-sm mb-3">{announcement.content}</p>
                <div className="flex gap-2">
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

      <ProfileSection title="Post a Course Announcement" icon={PlusSquare}>
        {teachingCourses.length === 0 ? (
          <p className="text-parchment-dim text-sm">You have not yet been assigned any courses.</p>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <FormField label="Course" htmlFor="announcement-course">
              <Select id="announcement-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
                <option value="">Choose a course&hellip;</option>
                {teachingCourses.map((course) => (
                  <option key={course.id} value={course.courseId}>
                    {coursesById.get(course.courseId)?.name ?? course.courseId}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Type" htmlFor="announcement-type">
              <Select
                id="announcement-type"
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value as AnnouncementType)}
              >
                {ANNOUNCEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Title" htmlFor="announcement-title">
              <Input id="announcement-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </FormField>
            <FormField label="Content" htmlFor="announcement-content">
              <textarea
                id="announcement-content"
                className={`${textareaClass} min-h-[100px]`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Expires (optional)" htmlFor="announcement-expires">
              <Input
                id="announcement-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-parchment-dim">
              <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
              Publish immediately
            </label>
            {error && <p className="text-ember text-sm">{error}</p>}
            <Button type="submit" size="sm" disabled={submitting} className="self-start">
              {submitting ? "Posting…" : "Post Announcement"}
            </Button>
          </form>
        )}
      </ProfileSection>
    </div>
  );
}
