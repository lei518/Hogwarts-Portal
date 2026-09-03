import { Flag, HandHelping } from "lucide-react";
import { lostAndFoundService, lostFoundItems, type LostFoundItem } from "../../data/lostAndFound";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ItemRow({ item }: { item: LostFoundItem }) {
  return (
    <div className="border border-parchment-dim/15 rounded-sm px-4 py-3">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-parchment text-sm font-display">{item.name}</p>
        <span className="text-parchment-dim text-xs shrink-0">{formatDate(item.foundDate)}</span>
      </div>
      <p className="text-parchment-dim text-xs mb-1">{item.description}</p>
      <p className="text-parchment-dim text-xs">Found in: {item.foundLocation}</p>
    </div>
  );
}

export function LostAndFoundPage() {
  const sorted = [...lostFoundItems].sort((a, b) => b.foundDate.localeCompare(a.foundDate));
  const unclaimed = sorted.filter((item) => item.status === "Unclaimed");
  const claimed = sorted.filter((item) => item.status === "Claimed");

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={lostAndFoundService} />

      <ProfileSection title="Recently Found Items">
        <div className="flex flex-col gap-2">
          {sorted.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title={`Unclaimed Items (${unclaimed.length})`}>
          {unclaimed.length === 0 ? (
            <p className="text-parchment-dim text-sm">Nothing unclaimed right now.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {unclaimed.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title={`Claimed Items (${claimed.length})`}>
          {claimed.length === 0 ? (
            <p className="text-parchment-dim text-sm">No items have been claimed yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {claimed.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </ProfileSection>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Report Lost Item" icon={Flag}>
          <p className="text-parchment-dim text-sm">Reporting a lost item isn't available yet.</p>
        </ProfileSection>
        <ProfileSection title="Claim Item" icon={HandHelping}>
          <p className="text-parchment-dim text-sm">Claiming an item isn't available yet.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
