import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wand2, BookOpen, CheckCircle2 } from "lucide-react";
import { getSpell, spells } from "../../data/spells";
import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";

// Phase 4 - Spell Archive detail: Basic Information + Academic Information,
// and a "Mark as Studied" bookmark - no difficulty, mana cost, or lock
// state anywhere on this page.
export function SpellDetailPage() {
  const { spellId } = useParams<{ spellId: string }>();
  const { state, dispatch } = useGame();
  const { character } = state;

  const spell = spellId ? getSpell(spellId) : undefined;

  if (!character) return null;

  if (!spell) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <EmptyState
          message="This spell could not be found."
          icon={Wand2}
          action={
            <Link to="/spells" className="text-gold hover:text-gold-bright text-sm">
              &larr; Back to Spell Archive
            </Link>
          }
        />
      </div>
    );
  }

  const progress = character.spellbook.find((s) => s.spellId === spell.id);
  const studied = progress?.studied ?? false;
  const relatedSpells = (spell.relatedSpellIds ?? [])
    .map((id) => spells.find((s) => s.id === id))
    .filter((s) => s !== undefined);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/spells" className="inline-flex items-center gap-1 text-gold hover:text-gold-bright text-xs w-fit">
        <ArrowLeft size={14} /> Back to Spell Archive
      </Link>

      <Card as="section" className="px-6 py-6">
        <PageHeader
          title={spell.name}
          icon={Wand2}
          action={studied ? <Badge tone="emerald">Studied</Badge> : undefined}
        />
        <p className="text-parchment-dim italic text-sm mt-3 mb-4">"{spell.incantation}"</p>
        <p className="text-parchment text-sm leading-relaxed mb-5">{spell.description}</p>

        {studied ? (
          <p className="flex items-center gap-1.5 text-gold text-sm">
            <CheckCircle2 size={16} />
            Studied{progress?.studiedAt ? ` on ${new Date(progress.studiedAt).toLocaleDateString()}` : ""}
          </p>
        ) : (
          <Button onClick={() => dispatch({ type: "STUDY_SPELL", payload: { spellId: spell.id } })}>
            Mark as Studied
          </Button>
        )}
      </Card>

      <ProfileSection title="Academic Information" icon={BookOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <ProfileField label="Ministry Classification" value={spell.category} />
          <ProfileField label="Curriculum Year" value={`Year ${spell.requiredYear}`} />
          <ProfileField label="Known Counter-spell" value={spell.counterSpell ?? "None on file"} />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">History</p>
            <p className="text-parchment-dim text-sm leading-relaxed">{spell.history}</p>
          </div>
          <div>
            <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Common Uses</p>
            <p className="text-parchment-dim text-sm leading-relaxed">{spell.commonUses}</p>
          </div>
          {relatedSpells.length > 0 && (
            <div>
              <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1.5">Related Spells</p>
              <div className="flex flex-wrap gap-2">
                {relatedSpells.map((related) => (
                  <Link
                    key={related!.id}
                    to={`/spells/${related!.id}`}
                    className="text-xs border border-parchment-dim/25 rounded-full px-3 py-1 text-parchment hover:border-gold hover:text-gold-bright transition-colors"
                  >
                    {related!.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ProfileSection>
    </div>
  );
}
