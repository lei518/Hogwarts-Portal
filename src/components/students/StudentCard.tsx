import { useNavigate } from "react-router-dom";
import type { Student } from "../../data/students";
import { houseInfo } from "../../data/sortingQuestions";
import { Card } from "../ui/Card";

// Phase 7A - `student` is a real account (see repositories/studentsRepository.ts).
// House/year can be null (not yet sorted, or an account with none assigned) -
// shown honestly rather than fabricated.
export function StudentCard({ student }: { student: Student }) {
  const navigate = useNavigate();
  const house = student.house ? houseInfo[student.house] : undefined;

  return (
    <Card interactive className="p-0 overflow-hidden">
      <button onClick={() => navigate(`/students/${student.id}`)} className="w-full text-left p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-display text-lg text-parchment">{student.name}</h3>
          {house && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: house.colors.secondary }}
              aria-hidden="true"
            />
          )}
        </div>
        <p
          className="text-parchment-dim text-xs"
          style={house ? { color: house.colors.secondary } : undefined}
        >
          {student.house ?? "Not yet sorted"} &middot; {student.year ? `Year ${student.year}` : "Year not on file"}
        </p>
      </button>
    </Card>
  );
}
