import { useState } from "react";
import { MessageCircleWarning } from "lucide-react";
import { useAdminAnalytics } from "../../utils/adminAnalytics";
import { useAdminScope } from "../../utils/adminScope";
import { houseInfo } from "../../data/sortingQuestions";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import type { House } from "../../types/game";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const HOUSES: House[] = ["Gryffindor", "Ravenclaw", "Hufflepuff", "Slytherin"];

const inputClass =
  "bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";
const labelClass = "text-parchment-dim text-[11px] uppercase tracking-wide mb-1 block";

// Standings/awards above remain a read-only review of the real House Cup
// ledger (Character.housePoints/housePointAwards). The adjustment ledger
// below is a completely separate, local-only model
// (AdminContext.housePointAdjustments) - it never modifies
// Character.housePoints, per CLAUDE.md's Admin Portal section. Analytics
// includes this ledger as its own, separately-labeled total.
// Authentication Foundation (Phase 6C): admin comes from useAdminScope(),
// the signed-in administrator's own identity - manual adjustments are
// attributed to whoever is actually signed in, not a hardcoded name.
export function HouseCupManagementPage() {
  const stats = useAdminAnalytics();
  const { profile: admin, housePointAdjustments, addHousePointAdjustment, markAdjustmentReviewed, loading } =
    useAdminScope();

  const [house, setHouse] = useState<House>("Gryffindor");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  function submit(sign: 1 | -1) {
    const magnitude = Number(amount);
    if (!reason.trim() || Number.isNaN(magnitude) || magnitude <= 0 || !admin) return;
    addHousePointAdjustment({ house, amount: magnitude * sign, reason: reason.trim(), adminName: admin.displayName });
    setAmount("");
    setReason("");
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading House Cup data…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🏆 House Cup Management</h1>
        <p className="text-parchment-dim text-sm">
          {stats.activeCharacterName
            ? `Standings for the currently signed-in student, ${stats.activeCharacterName}.`
            : "Standings and awards for the currently signed-in student."}
        </p>
      </div>

      {stats.houseCupStandings.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No active Character session to report on.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {stats.houseCupStandings.map(({ house: standingHouse, points }, index) => {
              const info = houseInfo[standingHouse];
              return (
                <div
                  key={standingHouse}
                  className="flex items-center justify-between gap-3 border border-parchment-dim/20 rounded-sm px-5 py-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-parchment-dim text-sm w-4">{index + 1}</span>
                    <span>{info.emoji}</span>
                    <span className="text-parchment truncate">{standingHouse}</span>
                  </div>
                  <span className="font-display text-lg" style={{ color: info.colors.secondary }}>
                    {points} pts
                  </span>
                </div>
              );
            })}
          </div>

          <ProfileSection title="Recent Awards">
            {stats.recentHouseAwards.length === 0 ? (
              <p className="text-parchment-dim text-sm">No awards recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.recentHouseAwards.map((award) => (
                  <div key={award.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-parchment truncate">
                      {award.reason} &middot; {award.house}
                    </span>
                    <span className="text-parchment-dim text-xs shrink-0">
                      {award.awardedBy} &middot; {formatTimestamp(award.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ProfileSection>
        </>
      )}

      <ProfileSection title="Manual Adjustments">
        <div className="flex flex-col gap-2 mb-4">
          {housePointAdjustments.length === 0 ? (
            <p className="text-parchment-dim text-sm">No adjustments logged yet.</p>
          ) : (
            housePointAdjustments.map((adjustment) => (
              <div
                key={adjustment.id}
                className="flex items-center justify-between gap-3 border border-parchment-dim/10 rounded-sm px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">
                    {adjustment.house} &middot;{" "}
                    <span className={adjustment.amount >= 0 ? "text-[#6b9e6b]" : "text-[#c77b7b]"}>
                      {adjustment.amount >= 0 ? "+" : ""}
                      {adjustment.amount}
                    </span>
                  </p>
                  <p className="text-parchment-dim text-xs truncate">{adjustment.reason}</p>
                  <p className="text-parchment-dim text-xs">
                    {adjustment.adminName} &middot; {formatTimestamp(adjustment.timestamp)}
                  </p>
                </div>
                {adjustment.reviewed ? (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[#6b9e6b66] text-[#6b9e6b] bg-[#6b9e6b15] shrink-0">
                    Reviewed
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    className="px-3 py-1 text-xs shrink-0"
                    onClick={() => markAdjustmentReviewed(adjustment.id)}
                  >
                    Mark Reviewed
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-t border-parchment-dim/10 pt-4">
          <div>
            <label className={labelClass} htmlFor="adjustment-house">House</label>
            <select id="adjustment-house" className={inputClass} value={house} onChange={(e) => setHouse(e.target.value as House)}>
              {HOUSES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="adjustment-amount">Points</label>
            <input
              id="adjustment-amount"
              type="number"
              min={1}
              className={`${inputClass} w-24`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelClass} htmlFor="adjustment-reason">Reason</label>
            <input
              id="adjustment-reason"
              className={`${inputClass} w-full`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being adjusted?"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => submit(1)}>Add</Button>
            <Button variant="secondary" onClick={() => submit(-1)}>
              Remove
            </Button>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection title="Appeals" icon={MessageCircleWarning}>
        <p className="text-parchment-dim text-sm">
          Reviewing a student's dispute over a points deduction will be available here in a future milestone.
        </p>
      </ProfileSection>
    </div>
  );
}
