import { useNavigate, useParams } from "react-router-dom";
import { getStudent, students } from "../../data/students";
import { houseInfo } from "../../data/sortingQuestions";
import { useGame } from "../../context/GameContext";
import { getRelationshipLevel } from "../../utils/relationships";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";

const INTERACTIONS: { label: string; delta: number; variant: "primary" | "secondary" }[] = [
  { label: "Help", delta: 10, variant: "primary" },
  { label: "Give Gift", delta: 8, variant: "primary" },
  { label: "Talk", delta: 3, variant: "secondary" },
  { label: "Insult", delta: -5, variant: "secondary" },
];

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();

  const student = id ? getStudent(id) : undefined;

  if (!student) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl text-gold-bright mb-4">Student not found</h1>
        <Button onClick={() => navigate("/students")}>Back to Students</Button>
      </div>
    );
  }

  const house = houseInfo[student.house];
  const relationshipValue = state.character?.relationships[student.id] ?? 0;

  function handleInteract(delta: number) {
    dispatch({ type: "CHANGE_RELATIONSHIP", payload: { studentId: student!.id, delta } });
  }

  const friends = student.friends.map((fid) => students.find((s) => s.id === fid)).filter(Boolean);
  const rivals = student.rivals.map((rid) => students.find((s) => s.id === rid)).filter(Boolean);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/students")}
        className="text-parchment-dim text-sm hover:text-gold mb-6"
      >
        ← Back to Students
      </button>

      <div
        className="border rounded-sm overflow-hidden"
        style={{ borderColor: `${house.colors.secondary}55` }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${house.colors.primary}, ${house.colors.primary}dd)`,
          }}
        >
          <div>
            <h1 className="text-2xl font-display text-parchment">{student.name}</h1>
            <p className="text-parchment/70 text-sm">Year {student.year}</p>
          </div>
          <p className="text-2xl" style={{ color: house.colors.secondary }}>
            {house.emoji} {student.house}
          </p>
        </div>

        <div className="bg-void/60 px-6 py-6">
          <p className="text-parchment-dim leading-relaxed mb-5">{student.bio}</p>

          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">Traits</p>
              <p className="text-parchment">{student.traits.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">
                Favorite Subjects
              </p>
              <p className="text-parchment">{student.favoriteSubjects.join(", ")}</p>
            </div>
          </div>

          {(friends.length > 0 || rivals.length > 0) && (
            <div className="grid grid-cols-2 gap-5 mb-6">
              {friends.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">Friends</p>
                  <div className="flex flex-col gap-1">
                    {friends.map((f) => (
                      <button
                        key={f!.id}
                        onClick={() => navigate(`/students/${f!.id}`)}
                        className="text-left text-gold-bright hover:underline text-sm"
                      >
                        {f!.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {rivals.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">Rivals</p>
                  <div className="flex flex-col gap-1">
                    {rivals.map((r) => (
                      <button
                        key={r!.id}
                        onClick={() => navigate(`/students/${r!.id}`)}
                        className="text-left text-ember hover:underline text-sm"
                      >
                        {r!.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <ProgressBar
              value={relationshipValue}
              label={`${getRelationshipLevel(relationshipValue)} · ${relationshipValue}/100`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {INTERACTIONS.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={() => handleInteract(action.delta)}
              >
                {action.label} ({action.delta > 0 ? "+" : ""}
                {action.delta})
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
