import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Stethoscope, XCircle } from "lucide-react";
import { medicalRequestsRepository } from "../../repositories/medicalRequestsRepository";
import { useAuth } from "../../context/AuthContext";
import { useOwlery } from "../../context/OwleryContext";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import { listDirectoryProfiles, type DirectoryProfile, type MedicalRequestRow, type MedicalRequestStatus } from "../../services/supabase";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SchoolAnnouncementsPreview } from "../../components/announcements/SchoolAnnouncementsPreview";

const STATUS_COLORS: Record<MedicalRequestStatus, string> = {
  Pending: "#c9a646",
  Approved: "#5b8fb9",
  Completed: "#6b9e6b",
  Rejected: "#c77b7b",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 5 - Campus Services. Healer Portal: review and process Hospital
// Wing appointment requests - Approve/Complete/Reject each send a real
// Service Update message to the requesting student (see CLAUDE.md's
// "these must become real workflows" instruction).
export function HealerDashboardPage() {
  const { user } = useAuth();
  const { send } = useOwlery();
  const { name: assignedHealerName } = useAssignedStaffName("Hospital Wing");
  const [requests, setRequests] = useState<MedicalRequestRow[]>([]);
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([medicalRequestsRepository.getAll(), listDirectoryProfiles()]).then(([loaded, loadedDirectory]) => {
      setRequests(loaded);
      setDirectory(loadedDirectory);
      setLoading(false);
    });
  }

  useEffect(loadAll, []);

  const namesById = useMemo(() => new Map(directory.map((p) => [p.userId, p.displayName])), [directory]);
  const sorted = [...requests].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (b.status === "Pending" && a.status !== "Pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  async function handleUpdate(request: MedicalRequestRow, status: MedicalRequestStatus) {
    if (!user) return;
    setActingId(request.id);
    try {
      await medicalRequestsRepository.updateStatus(request.id, status, user.id);
      await send({
        receiverId: request.studentId,
        subject: `Hospital Wing Request ${status}`,
        content: `Your appointment request ("${request.reason}") has been ${status.toLowerCase()}.`,
        messageType: "Service Update",
        relatedService: "hospital-wing",
        relatedId: request.id,
      });
      loadAll();
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading requests…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader title="Healer Dashboard" description="Review and process Hospital Wing requests." icon={Stethoscope} />
      <p className="text-parchment-dim text-xs -mt-3">Managed by: {assignedHealerName}</p>

      <SchoolAnnouncementsPreview />

      <ProfileSection title="Appointment Requests">
        {sorted.length === 0 ? (
          <EmptyState message="No requests have been submitted yet." icon={Stethoscope} />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((request) => {
              const color = STATUS_COLORS[request.status];
              return (
                <div key={request.id} className="border border-parchment-dim/15 rounded-md px-4 py-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-parchment text-sm font-display">
                      {namesById.get(request.studentId) ?? "Unknown Student"}
                    </p>
                    <span
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
                      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-parchment-dim text-xs mb-1">{request.reason}</p>
                  <p className="text-parchment-dim text-xs mb-2">Requested for {formatDate(request.requestedDate)}</p>
                  {request.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" disabled={actingId === request.id} onClick={() => handleUpdate(request, "Approved")}>
                        <CheckCircle2 size={13} /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actingId === request.id}
                        onClick={() => handleUpdate(request, "Rejected")}
                      >
                        <XCircle size={13} /> Reject
                      </Button>
                    </div>
                  )}
                  {request.status === "Approved" && (
                    <Button size="sm" disabled={actingId === request.id} onClick={() => handleUpdate(request, "Completed")}>
                      <CheckCircle2 size={13} /> Mark Completed
                    </Button>
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
