import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { FileWarning, History, ArrowLeft } from "lucide-react";
import { useProfessorGrades } from "../../context/ProfessorGradesContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { ProfileField, ProfileSection } from "../../components/character/ProfileSection";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

const textareaClass =
  "w-full bg-void/40 border border-parchment-dim/25 rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150 focus:border-gold focus:ring-2 focus:ring-gold/15";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Phase 2 - Real Academic Workflow. One student's real submission: reading
// what they actually wrote, entering a score/feedback. Writes go through
// ProfessorGradesContext's grade() - one atomic write to the live
// assignment_submissions table (score, max_score, feedback, graded_by,
// graded_at, status -> Graded). There's no separate "mark reviewed"/
// "return to student" step anymore - the real state model is just
// Submitted/Late/Graded.
export function ProfessorSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { grade } = useProfessorGrades();
  const { submissions, assignments, teachingCoursesById, studentsById, loading } = useProfessorScope();

  const submission = id ? submissions.find((s) => s.id === id) : undefined;
  const assignment = submission ? assignments.find((a) => a.id === submission.assignmentId) : undefined;
  const student = submission ? studentsById.get(submission.studentUserId) : undefined;

  const [scoreInput, setScoreInput] = useState(submission?.score?.toString() ?? "");
  const [maxScoreInput, setMaxScoreInput] = useState(
    submission?.maxScore?.toString() ?? assignment?.maxGrade?.toString() ?? "100"
  );
  const [feedbackInput, setFeedbackInput] = useState(submission?.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSaveGrade(event: FormEvent) {
    event.preventDefault();
    const score = Number(scoreInput);
    const maxScore = Number(maxScoreInput);
    if (Number.isNaN(score) || Number.isNaN(maxScore) || maxScore <= 0) return;

    setSaving(true);
    setError(null);
    try {
      await grade(submissionId, { score, maxScore, feedback: feedbackInput.trim() }, assignment?.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this grade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/professor/grades" className="inline-flex items-center gap-1.5 text-gold hover:text-gold-bright text-xs">
        <ArrowLeft size={13} /> Back to Grade Management
      </Link>

      <Card as="section" className="px-6 py-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright">
            {student?.studentName ?? "Unknown Student"}
          </h1>
          <SubmissionStatusBadge status={submission.status} />
        </div>
        <p className="text-parchment-dim text-sm mb-4">
          {assignment?.title ?? "Unknown Assignment"} &middot; {course?.name ?? "Unknown Course"} &middot;{" "}
          {teachingCourse?.section ?? "Unassigned section"}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ProfileField label="Submitted" value={formatDate(submission.submittedAt)} />
          <ProfileField
            label="Current Grade"
            value={submission.status === "Graded" ? `${submission.score}/${submission.maxScore}` : "Not yet graded"}
          />
        </div>

        <div className="border border-parchment-dim/20 rounded-md px-4 py-3 mb-5">
          <p className="text-parchment-dim text-xs uppercase tracking-wide mb-1">Submission</p>
          <p className="text-parchment text-sm whitespace-pre-wrap">{submission.submissionText}</p>
        </div>

        <form onSubmit={handleSaveGrade} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Score" htmlFor="submission-score">
              <Input
                id="submission-score"
                type="number"
                min={0}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Out Of" htmlFor="submission-max-score">
              <Input
                id="submission-max-score"
                type="number"
                min={1}
                value={maxScoreInput}
                onChange={(e) => setMaxScoreInput(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Feedback" htmlFor="submission-feedback">
            <textarea
              id="submission-feedback"
              className={`${textareaClass} min-h-[100px]`}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Notes for the student..."
            />
          </FormField>

          {error && <p className="text-ember text-sm">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Grade & Feedback"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Plagiarism Report" icon={FileWarning}>
          <p className="text-parchment-dim text-sm">An originality check against this student's past submissions.</p>
        </ProfileSection>

        <ProfileSection title="Version History" icon={History}>
          <p className="text-parchment-dim text-sm">Earlier drafts and grade revisions for this submission.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
