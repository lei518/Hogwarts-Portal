import { Link } from "react-router-dom";
import { ClipboardList, ShieldAlert } from "lucide-react";
import { students } from "../../data/students";
import { ProfileSection } from "../../components/character/ProfileSection";

// Read-only browse view over Resources' existing Student Directory
// (data/students.ts) - Admin Portal owns no student data of its own, per
// CLAUDE.md's Admin Portal section. Links out to the Student Portal's own
// profile page rather than duplicating its content.
export function StudentRecordsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🎓 Student Records</h1>
        <p className="text-parchment-dim text-sm">{students.length} students on file.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {students.map((student) => (
          <Link
            key={student.id}
            to={`/students/${student.id}`}
            className="block border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
          >
            <p className="font-display text-lg text-parchment mb-1">{student.name}</p>
            <p className="text-parchment-dim text-xs">
              {student.house} &middot; Year {student.year}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Enrollment Actions" icon={ClipboardList}>
          <p className="text-parchment-dim text-sm">
            Enrolling, transferring, or withdrawing a student will be available here in a future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Academic Holds" icon={ShieldAlert}>
          <p className="text-parchment-dim text-sm">
            Placing an administrative hold on a student's record will be available here in a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
