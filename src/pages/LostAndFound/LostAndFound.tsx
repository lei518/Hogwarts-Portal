import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Flag, HandHelping } from "lucide-react";
import { lostAndFoundService } from "../../data/lostAndFound";
import { lostFoundRepository } from "../../repositories/lostFoundRepository";
import { useAuth } from "../../context/AuthContext";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import type { LostFoundItemRow } from "../../services/supabase";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ItemRow({ item, action }: { item: LostFoundItemRow; action?: ReactNode }) {
  return (
    <Card className="px-4 py-3">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-parchment text-sm font-display">{item.itemName}</p>
        <span className="text-parchment-dim text-xs shrink-0">{formatDate(item.createdAt)}</span>
      </div>
      <p className="text-parchment-dim text-xs mb-1">{item.description}</p>
      <p className="text-parchment-dim text-xs mb-2">Found in: {item.locationFound ?? "Unknown"}</p>
      {action}
    </Card>
  );
}

// Phase 5 - Campus Services. Replaces the reserved "Report Lost Item"/
// "Claim Item" cards with a real report -> Caretaker-review workflow,
// backed by the live `lost_found_items` table.
export function LostAndFoundPage() {
  const { user } = useAuth();
  const { name: managedByName } = useAssignedStaffName("Lost & Found");
  const [items, setItems] = useState<LostFoundItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadItems() {
    setLoading(true);
    lostFoundRepository.getAll().then((all) => {
      setItems(all);
      setLoading(false);
    });
  }

  useEffect(loadItems, []);

  async function handleReport(event: FormEvent) {
    event.preventDefault();
    if (!user || !itemName.trim() || !description.trim() || !locationFound.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await lostFoundRepository.report({
        reportedBy: user.id,
        itemName: itemName.trim(),
        description: description.trim(),
        locationFound: locationFound.trim(),
      });
      setItemName("");
      setDescription("");
      setLocationFound("");
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit this report.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClaim(itemId: string) {
    if (!user) return;
    setClaimingId(itemId);
    try {
      await lostFoundRepository.updateStatus(itemId, "Claimed", user.id);
      loadItems();
    } finally {
      setClaimingId(null);
    }
  }

  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const found = sorted.filter((item) => item.status === "Found");
  const myReports = sorted.filter((item) => item.reportedBy === user?.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={lostAndFoundService} />
      <p className="text-parchment-dim text-xs -mt-3">Managed by: {managedByName}</p>

      {loading ? (
        <LoadingState label="Loading Lost & Found…" />
      ) : (
        <>
          <ProfileSection title="Recently Reported Items">
            <div className="flex flex-col gap-2">
              {sorted.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          </ProfileSection>

          <ProfileSection title={`Found Items (${found.length})`} icon={HandHelping}>
            {found.length === 0 ? (
              <p className="text-parchment-dim text-sm">Nothing marked found right now.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {found.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    action={
                      <Button size="sm" disabled={claimingId === item.id} onClick={() => handleClaim(item.id)}>
                        Claim This Item
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </ProfileSection>

          {myReports.length > 0 && (
            <ProfileSection title="My Reports">
              <div className="flex flex-col gap-2">
                {myReports.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <p className="text-parchment text-sm truncate">{item.itemName}</p>
                    <span className="text-parchment-dim text-xs shrink-0">{item.status}</span>
                  </div>
                ))}
              </div>
            </ProfileSection>
          )}
        </>
      )}

      <ProfileSection title="Report Lost Item" icon={Flag}>
        <form onSubmit={handleReport} className="flex flex-col gap-3">
          <FormField label="Item Name" htmlFor="lostfound-name">
            <Input id="lostfound-name" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          </FormField>
          <FormField label="Description" htmlFor="lostfound-description">
            <Input
              id="lostfound-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Location Found" htmlFor="lostfound-location">
            <Input
              id="lostfound-location"
              value={locationFound}
              onChange={(e) => setLocationFound(e.target.value)}
              required
            />
          </FormField>
          {error && <p className="text-ember text-sm">{error}</p>}
          <Button type="submit" size="sm" disabled={submitting} className="self-start">
            {submitting ? "Submitting…" : "Report Item"}
          </Button>
        </form>
      </ProfileSection>
    </div>
  );
}
