import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { FileWarning, History } from "lucide-react";
import { useProfessorGrades } from "../../context/ProfessorGradesContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { ProfileField, ProfileSection } from "../../components/character/ProfileSection";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";

const labelClass = "text-parchment-dim text-[11px] uppercase tracking-wide mb-1 block";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// One student's submission: entering a grade/feedback and moving it
// through the review workflow. Writes go through ProfessorGradesContext's
// setGrade/setFeedback/reviewSubmission/returnSubmission, never
// data/grades.ts or Character - this is a standalone grading workspace,
// not the Student Portal's grade record.
//
// Authentication Foundation (Phase 6B): the submission lookup is scoped to
// the signed-in professor's own submissions via useProfessorScope() -
// another professor's submission reads as Not Found. Write actions still
// come from ProfessorGradesContext (unchanged).
export function ProfessorSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setGrade, setFeedback, reviewSubmission, returnSubmission } = useProfessorGrades();
  const { submissions, assignments, teachingCoursesById, loading } = useProfessorScope();

  const submission = id ? submissions.find((s) => s.id === id) : undefined;
  const assignment = submission ? assignments.find((a) => a.id === submission.managedAssignmentId) : undefined;

  const [scoreInput, setScoreInput] = useState(submission?.grade?.score.toString() ?? "");
  const [maxScoreInput, setMaxScoreInput] = useState(
    submission?.grade?.maxScore.toString() ?? assignment?.maxGrade?.toString() ?? "100"
  );
  const [feedbackInput, setFeedbackInput] = useState(submission?.feedback ?? "");

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading submission…" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Submission Not Found</h1>
        <Link to="/professor/grades" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Grade Management
        </Link>
      </div>
    );
  }

  const submissionId = submission.id;
  const teachingCourse = assignment ? teachingCoursesById.get(assignment.teachingCourseId) : undefined;
  const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;

  function handleSaveGrade(event: FormEvent) {
    event.preventDefault();
    const score = Number(scoreInput);
    const maxScore = Number(maxScoreInput);
    if (Number.isNaN(score) || Number.isNaN(maxScore) || maxScore <= 0) return;
    setGrade(submissionId, { score, maxScore });
    setFeedback(submissionId, feedbackInput.trim());
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/professor/grades" className="text-gold hover:text-gold-bright text-xs">
        &larr; Back to Grade Management
      </Link>

      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright">{submission.studentName}</h1>
          <SubmissionStatusBadge status={submission.status} />
        </div>
        <p className="text-parchment-dim text-sm mb-4">
          {assignment?.title ?? "Unknown Assignment"} &middot; {course?.name ?? "Unknown Course"} &middot;{" "}
          {teachingCourse?.section ?? "Unassigned section"}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <ProfileField label="Submitted" value={formatDate(submission.submittedAt)} />
          <ProfileField
            label="Current Grade"
            value={submission.grade ? `${submission.grade.score}/${submission.grade.maxScore}` : "Not yet graded"}
          />
        </div>

        <form onSubmit={handleSaveGrade} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="submission-score">
                Score
              </label>
              <input
                id="submission-score"
                type="number"
                min={0}
                className={inputClass}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="submission-max-score">
                Out Of
              </label>
              <input
                id="submission-max-score"
                type="number"
                min={1}
                className={inputClass}
                value={maxScoreInput}
                onChange={(e) => setMaxScoreInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="submission-feedback">
              Feedback
            </label>
            <textarea
              id="submission-feedback"
              className={`${inputClass} min-h-[100px]`}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Notes for the student..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Save Grade &amp; Feedback</Button>
            {submission.status === "Pending" && (
              <Button type="button" variant="secondary" onClick={() => reviewSubmission(submission.id)}>
                Mark Reviewed
              </Button>
            )}
            {submission.status !== "Returned" && (
              <Button type="button" variant="secondary" onClick={() => returnSubmission(submission.id)}>
                Return to Student
              </Button>
            )}
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Plagiarism Report" icon={FileWarning}>
          <p className="text-parchment-dim text-sm">
            An originality check against past submissions will appear here in a future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Version History" icon={History}>
          <p className="text-parchment-dim text-sm">
            Earlier drafts and grade revisions for this submission will be tracked here in a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
