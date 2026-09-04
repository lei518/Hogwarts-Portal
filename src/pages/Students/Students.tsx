import { useMemo, useState } from "react";
import { students } from "../../data/students";
import { StudentCard } from "../../components/students/StudentCard";
import type { House } from "../../types/game";

const HOUSES: House[] = ["Gryffindor", "Ravenclaw", "Hufflepuff", "Slytherin"];

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [house, setHouse] = useState<House | "All">("All");
  const [year, setYear] = useState<number | "All">("All");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (house !== "All" && s.house !== house) return false;
      if (year !== "All" && s.year !== year) return false;
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [search, house, year]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-6">
        👥 Hogwarts Students
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          aria-label="Search students"
          className="flex-1 bg-void/50 border border-parchment-dim/30 rounded-sm px-4 py-2.5 text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none"
        />
        <select
          value={house}
          onChange={(e) => setHouse(e.target.value as House | "All")}
          className="bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2.5 text-parchment outline-none"
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
          className="bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2.5 text-parchment outline-none"
        >
          <option value="All">All years</option>
          {[1, 2, 3, 4, 5, 6, 7].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      <p className="text-parchment-dim text-sm mb-4">
        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-parchment-dim text-sm text-center mt-12">
          No students match your search.
        </p>
      )}
    </div>
  );
}
