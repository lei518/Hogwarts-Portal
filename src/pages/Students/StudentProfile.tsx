import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import type { Student } from "../../data/students";
import { studentsRepository } from "../../repositories/studentsRepository";
import { houseInfo } from "../../data/sortingQuestions";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";

// Phase 7A - `student` is a real account (see repositories/studentsRepository.ts).
// The old Friends/Rivals/relationship-interaction mechanics are gone -
// they were fabricated flavor tied entirely to the seeded roster, with no
// live equivalent (no "friendship" is tracked anywhere for real accounts).
// A student profile shows only real fields, plus a reserved section for
// what isn't built yet - same pattern as Course/Professor Detail.
export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    studentsRepository.getById(id).then((found) => {
      if (cancelled) return;
      setStudent(found);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-2xl mx-auto">
        <LoadingState label="Loading student…" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-2xl mx-auto">
        <Card className="flex flex-col items-center gap-4 text-center px-8 py-12">
          <UserX size={28} className="text-parchment-dim/60" />
          <h1 className="text-2xl font-display text-parchment">Student not found</h1>
          <Button onClick={() => navigate("/students")}>Back to Students</Button>
        </Card>
      </div>
    );
  }

  const house = student.house ? houseInfo[student.house] : undefined;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/students")}
        className="flex items-center gap-1.5 text-parchment-dim text-sm hover:text-gold mb-6"
      >
        <ArrowLeft size={15} />
        Back to Students
      </button>

      <div
        className="border rounded-lg overflow-hidden shadow-sm shadow-black/20"
        style={{ borderColor: house ? `${house.colors.secondary}55` : undefined }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            background: house
              ? `linear-gradient(135deg, ${house.colors.primary}, ${house.colors.primary}dd)`
              : undefined,
          }}
        >
          <div>
            <h1 className="text-2xl font-display text-parchment">{student.name}</h1>
            <p className="text-parchment/70 text-sm">{student.year ? `Year ${student.year}` : "Year not on file"}</p>
          </div>
          {house && (
            <p
              className="text-sm font-medium uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border"
              style={{ color: house.colors.secondary, borderColor: `${house.colors.secondary}55` }}
            >
              {student.house}
            </p>
          )}
        </div>

        <div className="bg-void/50 px-6 py-6">
          <p className="text-parchment-dim text-sm">Profile details have not yet been provided.</p>
        </div>
      </div>
    </div>
  );
}
