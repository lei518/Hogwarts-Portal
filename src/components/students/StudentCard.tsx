import { useNavigate } from "react-router-dom";
import type { Student } from "../../data/students";
import { houseInfo } from "../../data/sortingQuestions";

export function StudentCard({ student }: { student: Student }) {
  const navigate = useNavigate();
  const house = houseInfo[student.house];

  return (
    <button
      onClick={() => navigate(`/students/${student.id}`)}
      className="text-left border border-parchment-dim/25 rounded-sm p-4 hover:border-gold transition-colors bg-void/30"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg text-parchment">{student.name}</h3>
        <span>{house.emoji}</span>
      </div>
      <p className="text-parchment-dim text-xs mb-2" style={{ color: house.colors.secondary }}>
        {student.house} &middot; Year {student.year}
      </p>
      <p className="text-parchment-dim text-sm leading-relaxed line-clamp-2">{student.bio}</p>
    </button>
  );
}
