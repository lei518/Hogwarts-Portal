import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { submissionsRepository } from "../../repositories/submissionsRepository";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { AssignmentStatusBadge } from "../../components/academics/AssignmentStatusBadge";
import { ProfileField } from "../../components/character/ProfileSection";
import type { AssignmentDisplayStatus } from "../../types/academics";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

const textareaClass =
  "w-full bg-void/40 border border-parchment-dim/25 rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150 focus:border-gold focus:ring-2 focus:ring-gold/15";

// Phase 2 - Real Academic Workflow. Replaces the old "Mark as Submitted"
// toggle with a real submission (text goes to the live
// assignment_submissions table, see repositories/submissionsRepository.ts) -
// a professor can actually see and grade it.
export function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { state, dispatch } = useGame();
  const { character } = state;
  const { user } = useAuth();
  const { assignments, coursesById, professorsById, submissions, loading, refresh } = useAcademicData();
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!character) return null;

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading assignment…" />
      </div>
    );
  }

  const assignment = assignmentId ? assignments.find((a) => a.id === assignmentId) : undefined;

  if (!assignment) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <EmptyState
          message="This assignment could not be found."
          icon={ClipboardList}
          action={
            <Link to="/assignments" className="text-gold hover:text-gold-bright text-sm">
              &larr; Back to Assignments
            </Link>
          }
        />
      </div>
    );
  }

  const course = coursesById.get(assignment.courseId);
  const professor = course?.professorId ? professorsById.get(course.professorId) : undefined;
  const submission = submissions.find((s) => s.assignmentId === assignment.id);
  const status: AssignmentDisplayStatus = submission?.status ?? "Not Submitted";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!submissionText.trim() || !character || !user) return;

    setSubmitting(true);
    setError(null);
    try {
      await submissionsRepository.submit({
        assignmentId: assignment!.id,
        studentUserId: user.id,
        submissionText: submissionText.trim(),
        dueDate: assignment!.dueDate,
      });

      if (character.house && assignment!.housePointsReward) {
        dispatch({
          type: "AWARD_HOUSE_POINTS",
          payload: {
            house: character.house,
            amount: assignment!.housePointsReward,
            reason: `Submitted "${assignment!.title}"`,
            awardedBy: "Assignments",
          },
        });
      }

      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit this assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link
        to="/assignments"
        className="inline-flex items-center gap-1 text-gold hover:text-gold-bright text-xs w-fit"
      >
        <ArrowLeft size={14} /> Back to Assignments
      </Link>

      <Card as="section" className="px-6 py-6">
        <PageHeader
          title={`${assignment.itemType}: ${assignment.title}`}
          icon={ClipboardList}
          action={<AssignmentStatusBadge status={status} />}
        />
        <p className="text-parchment-dim text-sm mt-4 mb-1">
          {course ? (
            <Link to={`/courses/${course.id}`} className="text-gold hover:text-gold-bright">
              {course.name}
            </Link>
          ) : (
            assignment.courseId
          )}
        </p>
        <p className="text-parchment-dim text-xs mb-4">Professor: {professor?.name ?? "To Be Assigned"}</p>
        <p className="text-parchment text-sm leading-relaxed mb-5">{assignment.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <ProfileField label="Due Date" value={formatDate(assignment.dueDate)} />
          <ProfileField label="Max Score" value={assignment.maxGrade ?? "Not set"} />
          <ProfileField
            label="House Points"
            value={assignment.housePointsReward ? `+${assignment.housePointsReward}` : "None"}
          />
        </div>

        {submission ? (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-1.5 text-gold text-sm">
              <CheckCircle2 size={16} />
              Submitted on {formatDate(submission.submittedAt)}
            </p>
            <div className="border border-parchment-dim/20 rounded-md px-4 py-3">
              <p className="text-parchment-dim text-xs uppercase tracking-wide mb-1">Your Submission</p>
              <p className="text-parchment text-sm whitespace-pre-wrap">{submission.submissionText}</p>
            </div>
            {submission.status === "Graded" ? (
              <div className="border border-gold/25 rounded-md px-4 py-3">
                <p className="text-parchment-dim text-xs uppercase tracking-wide mb-1">Grade</p>
                <p className="text-gold-bright font-display text-lg mb-1">
                  {submission.score}/{submission.maxScore}
                </p>
                {submission.feedback && <p className="text-parchment-dim text-sm">{submission.feedback}</p>}
              </div>
            ) : (
              <p className="text-parchment-dim text-sm">Awaiting review from your professor.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              className={`${textareaClass} min-h-[140px]`}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Write your submission here..."
              aria-label="Your submission"
              required
            />
            {error && <p className="text-ember text-sm">{error}</p>}
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
