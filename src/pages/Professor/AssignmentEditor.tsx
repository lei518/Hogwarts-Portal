import { useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FileEdit, ArrowLeft, FilePlus, Pencil } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import type { AssignmentItemType } from "../../types/academics";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

const textareaClass =
  "w-full bg-void/40 border border-parchment-dim/25 rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150 focus:border-gold focus:ring-2 focus:ring-gold/15";

const cancelLinkClass =
  "inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide rounded-md border transition-all duration-200 px-8 py-3 text-sm bg-transparent text-parchment border-parchment-dim/40 hover:border-gold hover:text-gold-bright hover:-translate-y-px";

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
  const { professorId, teachingCourses, assignments, loading } = useProfessorScope();
  const existing = id ? assignments.find((a) => a.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [teachingCourseId, setTeachingCourseId] = useState(
    existing?.teachingCourseId ?? teachingCourses[0]?.id ?? ""
  );
  const [itemType, setItemType] = useState<AssignmentItemType>(existing?.itemType ?? "Assignment");
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");
  const [housePointsReward, setHousePointsReward] = useState(existing?.housePointsReward?.toString() ?? "");
  const [maxGrade, setMaxGrade] = useState(existing?.maxGrade?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !dueDate || !teachingCourseId || !professorId) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      teachingCourseId,
      itemType,
      dueDate,
      housePointsReward: housePointsReward ? Number(housePointsReward) : undefined,
      maxGrade: maxGrade ? Number(maxGrade) : undefined,
    };

    setSubmitting(true);
    setError(null);
    try {
      if (existing) {
        await updateAssignment(existing.id, payload);
        navigate(`/professor/assignments/${existing.id}`);
      } else {
        const created = await createAssignment(professorId, payload);
        navigate(`/professor/assignments/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  const cancelTo = existing ? `/professor/assignments/${existing.id}` : "/professor/assignments";

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to={cancelTo} className="inline-flex items-center gap-1.5 text-gold hover:text-gold-bright text-xs">
        <ArrowLeft size={13} /> Back
      </Link>

      <PageHeader
        title={existing ? "Edit Assignment" : "New Assignment"}
        description={existing ? "Changes are saved immediately." : "New assignments start as a draft."}
        icon={existing ? Pencil : FilePlus}
      />

      <Card className="px-6 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Title" htmlFor="assignment-title">
            <Input id="assignment-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </FormField>

          <FormField label="Description" htmlFor="assignment-description">
            <textarea
              id="assignment-description"
              className={`${textareaClass} min-h-[100px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Section" htmlFor="assignment-section">
              <Select
                id="assignment-section"
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
              </Select>
            </FormField>

            <FormField label="Type" htmlFor="assignment-type">
              <Select
                id="assignment-type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as AssignmentItemType)}
              >
                <option value="Assignment">Assignment</option>
                <option value="Quiz">Quiz</option>
                <option value="Exam">Exam</option>
              </Select>
            </FormField>

            <FormField label="Due Date" htmlFor="assignment-due-date">
              <Input
                id="assignment-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="House Points Reward" htmlFor="assignment-house-points">
              <Input
                id="assignment-house-points"
                type="number"
                min={0}
                value={housePointsReward}
                onChange={(e) => setHousePointsReward(e.target.value)}
                placeholder="Optional"
              />
            </FormField>

            <FormField label="Max Grade" htmlFor="assignment-max-grade">
              <Input
                id="assignment-max-grade"
                type="number"
                min={0}
                value={maxGrade}
                onChange={(e) => setMaxGrade(e.target.value)}
                placeholder="Optional"
              />
            </FormField>
          </div>

          {error && <p className="text-ember text-sm">{error}</p>}

          <div className="flex flex-wrap gap-3 mt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : existing ? "Save Changes" : "Create Draft"}
            </Button>
            <Link to={cancelTo} className={cancelLinkClass}>
              Cancel
            </Link>
          </div>
        </form>
      </Card>

      <ProfileSection title="Rubrics" icon={FileEdit}>
        <p className="text-parchment-dim text-sm">Attach clear grading criteria so students know what's expected.</p>
      </ProfileSection>
    </div>
  );
}
