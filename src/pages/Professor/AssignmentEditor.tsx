import { useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FileEdit } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";

const labelClass = "text-parchment-dim text-[11px] uppercase tracking-wide mb-1 block";

// Create/edit form for a ManagedAssignment - the "read/write locally" piece
// of Assignment Management. Writes go through
// ProfessorAssignmentsContext's createAssignment/updateAssignment, never
// data/assignments.ts (see types/professorPortal.ts's ManagedAssignment
// comment) - the Student Portal's canonical assignment source is untouched.
//
// Authentication Foundation (Phase 6B): the section picker only offers the
// signed-in professor's own teaching courses (useProfessorScope()), and the
// assignment being edited is looked up from that same scoped list - editing
// another professor's assignment reads as Not Found.
export function AssignmentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createAssignment, updateAssignment } = useProfessorAssignments();
  const { teachingCourses, assignments, loading } = useProfessorScope();
  const existing = id ? assignments.find((a) => a.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [teachingCourseId, setTeachingCourseId] = useState(
    existing?.teachingCourseId ?? teachingCourses[0]?.id ?? ""
  );
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");
  const [housePointsReward, setHousePointsReward] = useState(existing?.housePointsReward?.toString() ?? "");
  const [maxGrade, setMaxGrade] = useState(existing?.maxGrade?.toString() ?? "");

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  if (id && !existing) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Assignment Not Found</h1>
        <Link to="/professor/assignments" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Assignment Management
        </Link>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !dueDate || !teachingCourseId) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      teachingCourseId,
      dueDate,
      housePointsReward: housePointsReward ? Number(housePointsReward) : undefined,
      maxGrade: maxGrade ? Number(maxGrade) : undefined,
    };

    if (existing) {
      updateAssignment(existing.id, payload);
      navigate(`/professor/assignments/${existing.id}`);
    } else {
      const created = createAssignment(payload);
      navigate(`/professor/assignments/${created.id}`);
    }
  }

  const cancelTo = existing ? `/professor/assignments/${existing.id}` : "/professor/assignments";

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to={cancelTo} className="text-gold hover:text-gold-bright text-xs">
        &larr; Back
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">
          {existing ? "Edit Assignment" : "New Assignment"}
        </h1>
        <p className="text-parchment-dim text-sm">
          {existing ? "Changes are saved locally for this session." : "New assignments start as a draft."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-parchment-dim/20 rounded-sm px-6 py-6 flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="assignment-title">
            Title
          </label>
          <input
            id="assignment-title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="assignment-description">
            Description
          </label>
          <textarea
            id="assignment-description"
            className={`${inputClass} min-h-[100px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="assignment-section">
              Section
            </label>
            <select
              id="assignment-section"
              className={inputClass}
              value={teachingCourseId}
              onChange={(e) => setTeachingCourseId(e.target.value)}
              required
            >
              {teachingCourses.map((teachingCourse) => {
                const course = getCourse(teachingCourse.courseId);
                return (
                  <option key={teachingCourse.id} value={teachingCourse.id}>
                    {course?.name ?? teachingCourse.courseId} — {teachingCourse.section}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="assignment-due-date">
              Due Date
            </label>
            <input
              id="assignment-due-date"
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="assignment-house-points">
              House Points Reward
            </label>
            <input
              id="assignment-house-points"
              type="number"
              min={0}
              className={inputClass}
              value={housePointsReward}
              onChange={(e) => setHousePointsReward(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="assignment-max-grade">
              Max Grade
            </label>
            <input
              id="assignment-max-grade"
              type="number"
              min={0}
              className={inputClass}
              value={maxGrade}
              onChange={(e) => setMaxGrade(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          <Button type="submit">{existing ? "Save Changes" : "Create Draft"}</Button>
          <Link
            to={cancelTo}
            className="px-8 py-3 font-body text-sm tracking-wide rounded-sm border bg-transparent text-parchment border-parchment-dim/50 hover:border-gold hover:text-gold transition-colors duration-200"
          >
            Cancel
          </Link>
        </div>
      </form>

      <ProfileSection title="Rubrics" icon={FileEdit}>
        <p className="text-parchment-dim text-sm">
          Attaching a grading rubric while authoring an assignment will be available here in a future
          milestone.
        </p>
      </ProfileSection>
    </div>
  );
}
