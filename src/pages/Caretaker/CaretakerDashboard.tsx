import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PackageSearch, Search } from "lucide-react";
import { lostFoundRepository } from "../../repositories/lostFoundRepository";
import { useOwlery } from "../../context/OwleryContext";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import { listDirectoryProfiles, type DirectoryProfile, type LostFoundItemRow, type LostFoundStatus } from "../../services/supabase";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SchoolAnnouncementsPreview } from "../../components/announcements/SchoolAnnouncementsPreview";

const STATUS_COLORS: Record<LostFoundStatus, string> = {
  Reported: "#c9a646",
  Found: "#5b8fb9",
  Claimed: "#6b9e6b",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 5 - Campus Services. Caretaker Portal: track Lost & Found reports -
// mark Found/Claimed, each notifying the reporting/claiming student when
// their identity is known (a handful of seed records predate any real
// reporter and stay silent, per the "no fabricated sender" rule).
export function CaretakerDashboardPage() {
  const { send } = useOwlery();
  const { name: managedByName } = useAssignedStaffName("Lost & Found");
  const [items, setItems] = useState<LostFoundItemRow[]>([]);
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([lostFoundRepository.getAll(), listDirectoryProfiles()]).then(([loaded, loadedDirectory]) => {
      setItems(loaded);
      setDirectory(loadedDirectory);
      setLoading(false);
    });
  }

  useEffect(loadAll, []);

  const namesById = useMemo(() => new Map(directory.map((p) => [p.userId, p.displayName])), [directory]);
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function handleMarkFound(item: LostFoundItemRow) {
    setActingId(item.id);
    try {
      await lostFoundRepository.updateStatus(item.id, "Found");
      if (item.reportedBy) {
        await send({
          receiverId: item.reportedBy,
          subject: `Item Found: "${item.itemName}"`,
          content: `The item you reported, "${item.itemName}", has been found. Visit the Caretaker's office to claim it.`,
          messageType: "Service Update",
          relatedService: "lost-and-found",
          relatedId: item.id,
        });
      }
      loadAll();
    } finally {
      setActingId(null);
    }
  }

  async function handleMarkClaimed(item: LostFoundItemRow) {
    setActingId(item.id);
    try {
      await lostFoundRepository.updateStatus(item.id, "Claimed");
      loadAll();
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading Lost & Found…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader title="Caretaker Dashboard" description="Track items reported around the castle." icon={PackageSearch} />
      <p className="text-parchment-dim text-xs -mt-3">Managed by: {managedByName}</p>

      <SchoolAnnouncementsPreview />

      <ProfileSection title="Lost & Found Items">
        {sorted.length === 0 ? (
          <EmptyState message="No items have been reported yet." icon={PackageSearch} />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((item) => {
              const color = STATUS_COLORS[item.status];
              return (
                <div key={item.id} className="border border-parchment-dim/15 rounded-md px-4 py-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-parchment text-sm font-display">{item.itemName}</p>
                    <span
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
                      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-parchment-dim text-xs mb-1">{item.description}</p>
                  <p className="text-parchment-dim text-xs mb-2">
                    {item.locationFound ?? "Location unknown"} &middot; {formatDate(item.createdAt)}
                    {item.reportedBy && <> &middot; Reported by {namesById.get(item.reportedBy) ?? "Unknown"}</>}
                  </p>
                  <div className="flex gap-2">
                    {item.status === "Reported" && (
                      <Button size="sm" disabled={actingId === item.id} onClick={() => handleMarkFound(item)}>
                        <Search size={13} /> Mark Found
                      </Button>
                    )}
                    {item.status === "Found" && (
                      <Button size="sm" disabled={actingId === item.id} onClick={() => handleMarkClaimed(item)}>
                        <CheckCircle2 size={13} /> Mark Claimed
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
