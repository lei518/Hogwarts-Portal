import { useState } from "react";
import { MessageCircleWarning, Trophy } from "lucide-react";
import { useAdminAnalytics } from "../../utils/adminAnalytics";
import { useAdminScope } from "../../utils/adminScope";
import { houseInfo } from "../../data/sortingQuestions";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";
import type { House } from "../../types/game";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const HOUSES: House[] = ["Gryffindor", "Ravenclaw", "Hufflepuff", "Slytherin"];

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
      <PageHeader
        title="House Cup Management"
        description={
          stats.activeCharacterName
            ? `Standings for the currently signed-in student, ${stats.activeCharacterName}.`
            : "Standings and awards for the currently signed-in student."
        }
        icon={Trophy}
      />

      {stats.houseCupStandings.length === 0 ? (
        <EmptyState message="No active Character session to report on." icon={Trophy} />
      ) : (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>House</Th>
                <Th>Points</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.houseCupStandings.map(({ house: standingHouse, points }, index) => {
                const info = houseInfo[standingHouse];
                return (
                  <Tr key={standingHouse}>
                    <Td className="text-parchment-dim">{index + 1}</Td>
                    <Td style={{ color: info.colors.secondary }}>{standingHouse}</Td>
                    <Td className="font-display text-lg" style={{ color: info.colors.secondary }}>
                      {points} pts
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

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
                className="flex items-center justify-between gap-3 bg-void/30 border border-parchment-dim/15 rounded-lg px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">
                    {adjustment.house} &middot;{" "}
                    <span className={adjustment.amount >= 0 ? "text-pine" : "text-ember"}>
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
                  <Badge tone="emerald" className="shrink-0">
                    Reviewed
                  </Badge>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
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
          <FormField label="House" htmlFor="adjustment-house">
            <Select id="adjustment-house" value={house} onChange={(e) => setHouse(e.target.value as House)}>
              {HOUSES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Points" htmlFor="adjustment-amount" className="w-24">
            <Input
              id="adjustment-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormField>
          <FormField label="Reason" htmlFor="adjustment-reason" className="flex-1">
            <Input
              id="adjustment-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being adjusted?"
            />
          </FormField>
          <div className="flex items-end gap-2">
            <Button onClick={() => submit(1)}>Add</Button>
            <Button variant="secondary" onClick={() => submit(-1)}>
              Remove
            </Button>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection title="Appeals" icon={MessageCircleWarning}>
        <p className="text-parchment-dim text-sm">Review a student's dispute over a points deduction.</p>
      </ProfileSection>
    </div>
  );
}
