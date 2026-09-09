import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FlaskConical, Beaker, ShieldAlert, ScrollText, CheckCircle2 } from "lucide-react";
import { getPotion } from "../../data/potions";
import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";

// Phase 4 - Potion Archive detail: Basic/Brewing/Safety/Historical
// Information, and a "Mark as Studied" bookmark - no quiz, score, or
// brewing minigame anywhere on this page.
export function PotionDetailPage() {
  const { potionId } = useParams<{ potionId: string }>();
  const { state, dispatch } = useGame();
  const { character } = state;

  const potion = potionId ? getPotion(potionId) : undefined;

  if (!character) return null;

  if (!potion) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <EmptyState
          message="This potion could not be found."
          icon={FlaskConical}
          action={
            <Link to="/potions" className="text-gold hover:text-gold-bright text-sm">
              &larr; Back to Potion Archive
            </Link>
          }
        />
      </div>
    );
  }

  const progress = character.potionProgress[potion.id];
  const studied = progress?.studied ?? false;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/potions" className="inline-flex items-center gap-1 text-gold hover:text-gold-bright text-xs w-fit">
        <ArrowLeft size={14} /> Back to Potion Archive
      </Link>

      <Card as="section" className="px-6 py-6">
        <PageHeader
          title={potion.name}
          icon={FlaskConical}
          action={studied ? <Badge tone="emerald">Studied</Badge> : undefined}
        />
        <p className="text-parchment text-sm leading-relaxed mt-4 mb-2">{potion.description}</p>
        <p className="text-parchment-dim text-sm mb-5">
          <span className="text-parchment-dim uppercase text-[11px] tracking-wide">Uses:</span> {potion.uses}
        </p>

        {studied ? (
          <p className="flex items-center gap-1.5 text-gold text-sm">
            <CheckCircle2 size={16} />
            Studied{progress?.studiedAt ? ` on ${new Date(progress.studiedAt).toLocaleDateString()}` : ""}
          </p>
        ) : (
          <Button onClick={() => dispatch({ type: "STUDY_POTION", payload: { potionId: potion.id } })}>
            Mark as Studied
          </Button>
        )}
      </Card>

      <ProfileSection title="Brewing Information" icon={Beaker}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <ProfileField label="Brewing Time" value={`${potion.brewTimeDays} day${potion.brewTimeDays !== 1 ? "s" : ""}`} />
          <ProfileField label="Curriculum Year" value={`Year ${potion.requiredYear}`} />
        </div>

        <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">Ingredients</p>
        <ul className="mb-4 flex flex-col gap-1">
          {potion.ingredients.map((ing) => (
            <li key={ing.name} className="flex justify-between text-sm text-parchment">
              <span>{ing.name}</span>
              <span className="text-parchment-dim">{ing.amount}</span>
            </li>
          ))}
        </ul>

        <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">Equipment</p>
        <ul className="mb-4 flex flex-wrap gap-2">
          {potion.equipment.map((item) => (
            <li key={item} className="text-xs border border-parchment-dim/25 rounded-full px-3 py-1 text-parchment-dim">
              {item}
            </li>
          ))}
        </ul>

        {potion.preparation.length > 0 && (
          <>
            <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">Preparation</p>
            <ul className="mb-4 flex flex-col gap-1.5 list-disc list-inside">
              {potion.preparation.map((step, i) => (
                <li key={i} className="text-parchment-dim text-sm leading-relaxed">{step}</li>
              ))}
            </ul>
          </>
        )}

        <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">Instructions</p>
        <ol className="flex flex-col gap-1.5 list-decimal list-inside">
          {potion.instructions.map((step, i) => (
            <li key={i} className="text-parchment-dim text-sm leading-relaxed">{step}</li>
          ))}
        </ol>
      </ProfileSection>

      {(potion.warnings || potion.sideEffects || potion.storageInstructions) && (
        <ProfileSection title="Safety Information" icon={ShieldAlert}>
          <div className="flex flex-col gap-4">
            {potion.warnings && (
              <div>
                <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Warnings</p>
                <p className="text-parchment-dim text-sm leading-relaxed">{potion.warnings}</p>
              </div>
            )}
            {potion.sideEffects && (
              <div>
                <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Side Effects</p>
                <p className="text-parchment-dim text-sm leading-relaxed">{potion.sideEffects}</p>
              </div>
            )}
            {potion.storageInstructions && (
              <div>
                <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Storage Instructions</p>
                <p className="text-parchment-dim text-sm leading-relaxed">{potion.storageInstructions}</p>
              </div>
            )}
          </div>
        </ProfileSection>
      )}

      {(potion.historicalNotes || potion.knownDiscoveries || potion.famousBrewers) && (
        <ProfileSection title="Historical Information" icon={ScrollText}>
          <div className="flex flex-col gap-4">
            {potion.historicalNotes && (
              <div>
                <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Historical Notes</p>
                <p className="text-parchment-dim text-sm leading-relaxed">{potion.historicalNotes}</p>
              </div>
            )}
            {potion.knownDiscoveries && (
              <div>
                <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Known Discoveries</p>
                <p className="text-parchment-dim text-sm leading-relaxed">{potion.knownDiscoveries}</p>
              </div>
            )}
            {potion.famousBrewers && (
              <div>
                <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Famous Brewers</p>
                <p className="text-parchment-dim text-sm leading-relaxed">{potion.famousBrewers}</p>
              </div>
            )}
          </div>
        </ProfileSection>
      )}
    </div>
  );
}
