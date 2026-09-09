import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { permitsRepository } from "../../repositories/permitsRepository";
import { useAuth } from "../../context/AuthContext";
import { useOwlery } from "../../context/OwleryContext";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import { listDirectoryProfiles, type DirectoryProfile, type PermitRow, type PermitStatus } from "../../services/supabase";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SchoolAnnouncementsPreview } from "../../components/announcements/SchoolAnnouncementsPreview";

const STATUS_COLORS: Record<PermitStatus, string> = {
  Pending: "#c9a646",
  Approved: "#6b9e6b",
  Rejected: "#c77b7b",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 5 - Campus Services. Deputy Headmaster Portal: review Hogsmeade
// visit permits - Approve/Reject each send a real Service Update message
// to the requesting student.
export function DeputyHeadmasterDashboardPage() {
  const { user } = useAuth();
  const { send } = useOwlery();
  const { name: managedByName } = useAssignedStaffName("Hogsmeade Permits");
  const [permits, setPermits] = useState<PermitRow[]>([]);
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([permitsRepository.getAll(), listDirectoryProfiles()]).then(([loaded, loadedDirectory]) => {
      setPermits(loaded);
      setDirectory(loadedDirectory);
      setLoading(false);
    });
  }

  useEffect(loadAll, []);

  const namesById = useMemo(() => new Map(directory.map((p) => [p.userId, p.displayName])), [directory]);
  const sorted = [...permits].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (b.status === "Pending" && a.status !== "Pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  async function handleUpdate(permit: PermitRow, status: PermitStatus) {
    if (!user) return;
    setActingId(permit.id);
    try {
      await permitsRepository.updateStatus(permit.id, status, user.id);
      await send({
        receiverId: permit.studentId,
        subject: `Hogsmeade Permit ${status}`,
        content: `Your visit permit request for ${formatDate(permit.visitDate)} has been ${status.toLowerCase()}.`,
        messageType: "Service Update",
        relatedService: "hogsmeade-services",
        relatedId: permit.id,
      });
      loadAll();
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading permits…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader title="Deputy Headmaster Dashboard" description="Review Hogsmeade visit permits." icon={ShieldCheck} />
      <p className="text-parchment-dim text-xs -mt-3">Managed by: {managedByName}</p>

      <SchoolAnnouncementsPreview />

      <ProfileSection title="Visit Permit Requests">
        {sorted.length === 0 ? (
          <EmptyState message="No permit requests have been submitted yet." icon={ShieldCheck} />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((permit) => {
              const color = STATUS_COLORS[permit.status];
              return (
                <div key={permit.id} className="border border-parchment-dim/15 rounded-md px-4 py-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-parchment text-sm font-display">
                      {namesById.get(permit.studentId) ?? "Unknown Student"}
                    </p>
                    <span
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
                      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                    >
                      {permit.status}
                    </span>
                  </div>
                  <p className="text-parchment-dim text-xs mb-1">{permit.reason}</p>
                  <p className="text-parchment-dim text-xs mb-2">Visit date: {formatDate(permit.visitDate)}</p>
                  {permit.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" disabled={actingId === permit.id} onClick={() => handleUpdate(permit, "Approved")}>
                        <CheckCircle2 size={13} /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actingId === permit.id}
                        onClick={() => handleUpdate(permit, "Rejected")}
                      >
                        <XCircle size={13} /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
