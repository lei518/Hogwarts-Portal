import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import type { Professor } from "../../types/resources";
import { professorsRepository } from "../../repositories/professorsRepository";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";

// Phase 7A - Live Academic Data. Reads real professor accounts through
// professorsRepository instead of the seeded data/professors.ts array - see
// Part 1: every directory now shows only accounts an admin has actually
// created.
export function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    professorsRepository.getAll().then((loaded) => {
      if (!cancelled) {
        setProfessors(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <PageHeader
        title="Professor Directory"
        description="The staff teaching at Hogwarts this year."
        icon={GraduationCap}
      />

      {loading ? (
        <div className="mt-8">
          <LoadingState label="Loading the Professor Directory…" />
        </div>
      ) : professors.length === 0 ? (
        <div className="mt-8">
          <EmptyState message="No professors available." icon={GraduationCap} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {professors.map((professor) => (
            <Link key={professor.id} to={`/professors/${professor.id}`}>
              <Card interactive className="px-5 py-4">
                <p className="font-display text-lg text-parchment mb-1">{professor.name}</p>
                <p className="text-parchment-dim text-xs">{professor.title}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
