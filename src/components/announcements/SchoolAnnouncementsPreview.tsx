import { Megaphone } from "lucide-react";
import { useAcademicData } from "../../context/AcademicDataContext";
import { ProfileSection } from "../character/ProfileSection";
import { LoadingState } from "../ui/LoadingState";
import { AnnouncementTypeBadge } from "./AnnouncementTypeBadge";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 6 - Communication & Administration System. Shared by every Staff
// dashboard (Librarian/Healer/Caretaker/Deputy Headmaster) - the task's
// Part 3 asks each to show School Announcements. A preview only (latest
// 3), same "Home previews, the owning page manages" rule as everywhere
// else - the Announcement Board (/announcements) owns the full list.
export function SchoolAnnouncementsPreview() {
  const { announcements, loading } = useAcademicData();

  if (loading) {
    return (
      <ProfileSection title="School Announcements" icon={Megaphone}>
        <LoadingState label="Loading announcements…" />
      </ProfileSection>
    );
  }

  const latest = [...announcements]
    .filter((a) => a.visibility === "School")
    .sort(
      (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <ProfileSection title="School Announcements" icon={Megaphone}>
      {latest.length === 0 ? (
        <p className="text-parchment-dim text-sm">No announcements available.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {latest.map((announcement) => (
            <div key={announcement.id} className="flex items-center justify-between gap-3">
              <p className="text-parchment text-sm truncate">{announcement.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <AnnouncementTypeBadge type={announcement.announcementType} />
                <span className="text-parchment-dim text-xs">
                  {formatDate(announcement.publishedAt ?? announcement.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
