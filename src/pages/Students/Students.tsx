import { useEffect, useMemo, useState } from "react";
import { Users, Search } from "lucide-react";
import type { Student } from "../../data/students";
import { studentsRepository } from "../../repositories/studentsRepository";
import { StudentCard } from "../../components/students/StudentCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import type { House } from "../../types/game";

const HOUSES: House[] = ["Gryffindor", "Ravenclaw", "Hufflepuff", "Slytherin"];

// Phase 7A - Live Academic Data. Reads real student accounts through
// studentsRepository instead of the seeded data/students.ts array - see
// Part 1: every directory now shows only accounts an admin has actually
// created.
export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [house, setHouse] = useState<House | "All">("All");
  const [year, setYear] = useState<number | "All">("All");

  useEffect(() => {
    let cancelled = false;
    studentsRepository.getAll().then((loaded) => {
      if (!cancelled) {
        setStudents(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (house !== "All" && s.house !== house) return false;
      if (year !== "All" && s.year !== year) return false;
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [students, search, house, year]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <PageHeader title="Hogwarts Students" description="Browse the student directory." icon={Users} />

      <div className="flex flex-col sm:flex-row gap-3 my-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-dim/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            aria-label="Search students"
            className="w-full bg-void/50 border border-parchment-dim/30 rounded-md pl-10 pr-4 py-2.5 text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none"
          />
        </div>
        <select
          value={house}
          onChange={(e) => setHouse(e.target.value as House | "All")}
          className="bg-void/50 border border-parchment-dim/30 rounded-md px-3 py-2.5 text-parchment outline-none"
        >
          <option value="All">All houses</option>
          {HOUSES.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value === "All" ? "All" : Number(e.target.value))}
          className="bg-void/50 border border-parchment-dim/30 rounded-md px-3 py-2.5 text-parchment outline-none"
        >
          <option value="All">All years</option>
          {[1, 2, 3, 4, 5, 6, 7].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading the Student Directory…" />
      ) : (
        <>
          <p className="text-parchment-dim text-sm mb-4">
            {filtered.length} student{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={Search}
                message={students.length === 0 ? "No students enrolled." : "No students match your search."}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
