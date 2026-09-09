import { useEffect, useState, type FormEvent } from "react";
import { FileText, CalendarCheck } from "lucide-react";
import {
  hospitalWingService,
  availableServices,
  emergencyCare,
  recoveryRooms,
} from "../../data/hospitalWing";
import { medicalRequestsRepository } from "../../repositories/medicalRequestsRepository";
import { useAuth } from "../../context/AuthContext";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import type { MedicalRequestRow, MedicalRequestStatus } from "../../services/supabase";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { LoadingState } from "../../components/ui/LoadingState";

const ROOM_STATUS_COLORS: Record<string, string> = {
  Available: "#6b9e6b",
  Occupied: "#c77b7b",
  Reserved: "#c9a646",
};

const REQUEST_STATUS_COLORS: Record<MedicalRequestStatus, string> = {
  Pending: "#c9a646",
  Approved: "#5b8fb9",
  Completed: "#6b9e6b",
  Rejected: "#c77b7b",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 5 - Campus Services. Replaces the reserved "Appointment Requests"
// card with a real request -> Healer-review workflow backed by the live
// `medical_requests` table.
export function HospitalWingPage() {
  const { user } = useAuth();
  const { name: assignedHealerName } = useAssignedStaffName("Hospital Wing");
  const [requests, setRequests] = useState<MedicalRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadRequests() {
    if (!user) return;
    setLoading(true);
    medicalRequestsRepository.getAll().then((all) => {
      setRequests(all.filter((r) => r.studentId === user.id));
      setLoading(false);
    });
  }

  useEffect(loadRequests, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !reason.trim() || !requestedDate) return;
    setSubmitting(true);
    setError(null);
    try {
      await medicalRequestsRepository.create({ studentId: user.id, reason: reason.trim(), requestedDate });
      setReason("");
      setRequestedDate("");
      loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit this request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={hospitalWingService} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Assigned Healer">
          <ProfileField label="Name" value={assignedHealerName} />
        </ProfileSection>

        <ProfileSection title="Emergency Care">
          <p className="text-parchment-dim text-sm">{emergencyCare.description}</p>
        </ProfileSection>
      </div>

      <ProfileSection title="Available Services">
        <div className="flex flex-col gap-3">
          {availableServices.map((service) => (
            <div key={service.id}>
              <p className="text-parchment text-sm font-display">{service.name}</p>
              <p className="text-parchment-dim text-xs">{service.description}</p>
            </div>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="Recovery Rooms">
        <div className="flex flex-col gap-2">
          {recoveryRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-parchment text-sm">{room.name}</p>
                <p className="text-parchment-dim text-xs">Capacity: {room.capacity}</p>
              </div>
              <span
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{
                  color: ROOM_STATUS_COLORS[room.status],
                  borderColor: `${ROOM_STATUS_COLORS[room.status]}66`,
                  background: `${ROOM_STATUS_COLORS[room.status]}15`,
                }}
              >
                {room.status}
              </span>
            </div>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="My Appointment Requests" icon={CalendarCheck}>
        {loading ? (
          <LoadingState label="Loading your requests…" />
        ) : requests.length === 0 ? (
          <p className="text-parchment-dim text-sm mb-4">You haven't requested an appointment yet.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {requests.map((request) => {
              const color = REQUEST_STATUS_COLORS[request.status];
              return (
                <div key={request.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-parchment text-sm truncate">{request.reason}</p>
                    <p className="text-parchment-dim text-xs">Requested for {formatDate(request.requestedDate)}</p>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
                    style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                  >
                    {request.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FormField label="Reason" htmlFor="hospital-reason">
            <Input id="hospital-reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </FormField>
          <FormField label="Requested Date" htmlFor="hospital-date">
            <Input
              id="hospital-date"
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              required
            />
          </FormField>
          {error && <p className="text-ember text-sm">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting} className="self-start">
            {submitting ? "Submitting…" : "Request Appointment"}
          </Button>
        </form>
      </ProfileSection>

      <ProfileSection title="Medical Records" icon={FileText}>
        <p className="text-parchment-dim text-sm">Your medical history isn't available here yet.</p>
      </ProfileSection>
    </div>
  );
}
