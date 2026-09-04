import { useState } from "react";
import { Link } from "react-router-dom";
import { Target, CalendarClock, ClipboardList, StickyNote, Bell, PartyPopper, Award, BookOpen, X } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { getCurrentObjectives } from "../../utils/objectives";
import { getUpcomingSchedule, getUpcomingAssignments } from "../../utils/academics";
import { getUpcomingCalendarEvents } from "../../utils/academicCalendar";
import { getGradedCourses } from "../../utils/grades";
import { getUpcomingDueDates } from "../../data/libraryServices";
import { getCourse } from "../../data/courses";
import { ProfileSection } from "../../components/character/ProfileSection";

const inputClass =
  "flex-1 bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";

// The student's daily workspace. Every section either reflects a system
// that owns its own data (Campus Map's objectives, Academics' schedule) or
// is owned directly by the Planner (Notes, Reminders) - see CLAUDE.md's
// Home-vs-Planner pattern. Nothing here duplicates state another page owns.
export function QuestLogPage() {
  const { state, dispatch } = useGame();
  const { character } = state;
  const [noteText, setNoteText] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  if (!character) return null;

  const objectives = getCurrentObjectives(character);
  const upcomingClasses = getUpcomingSchedule(character, 4);
  const upcomingEvents = getUpcomingCalendarEvents(4);
  const upcomingAssignments = getUpcomingAssignments(character, 4);
  const gradedCourses = getGradedCourses(character);
  const upcomingDueDates = getUpcomingDueDates();

  function handleAddNote() {
    if (!noteText.trim()) return;
    dispatch({ type: "ADD_PERSONAL_NOTE", payload: noteText.trim() });
    setNoteText("");
  }

  function handleAddReminder() {
    if (!reminderText.trim()) return;
    dispatch({
      type: "ADD_REMINDER",
      payload: { text: reminderText.trim(), dueDate: reminderDate || undefined },
    });
    setReminderText("");
    setReminderDate("");
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🗓️ Student Planner</h1>
      <p className="text-parchment-dim text-sm mb-8">Your daily workspace, gathered from across the portal.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <ProfileSection title="Current Objectives" icon={Target}>
          {objectives.length === 0 ? (
            <p className="text-parchment-dim text-sm">You're all caught up.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {objectives.map((objective) => (
                <div key={objective.id}>
                  <p className="text-parchment text-sm">{objective.title}</p>
                  <p className="text-parchment-dim text-xs mb-1">{objective.description}</p>
                  {objective.actionPath && (
                    <Link
                      to={objective.actionPath}
                      className="text-gold hover:text-gold-bright text-xs"
                    >
                      {objective.actionLabel ?? "Open"} &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="Upcoming Classes" icon={CalendarClock}>
          {upcomingClasses.length === 0 ? (
            <p className="text-parchment-dim text-sm">
              Class schedules haven't been published yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcomingClasses.map((entry) => {
                const course = getCourse(entry.courseId);
                return (
                  <p key={entry.id} className="text-parchment text-sm truncate">
                    <span className="text-parchment-dim">
                      {entry.day} {entry.startTime}
                    </span>{" "}
                    {course?.name ?? entry.courseId}
                  </p>
                );
              })}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="Assignment Deadlines" icon={ClipboardList}>
          {upcomingAssignments.length === 0 ? (
            <p className="text-parchment-dim text-sm">Nothing due - you're caught up.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcomingAssignments.map((assignment) => {
                const course = getCourse(assignment.courseId);
                return (
                  <Link
                    key={assignment.id}
                    to={`/assignments/${assignment.id}`}
                    className="text-sm truncate hover:text-gold-bright transition-colors"
                  >
                    <span className="text-parchment-dim">
                      {new Date(`${assignment.dueDate}T00:00:00`).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>{" "}
                    <span className="text-parchment">{assignment.title}</span>
                    {course && <span className="text-parchment-dim"> &middot; {course.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="Upcoming Events" icon={PartyPopper}>
          {upcomingEvents.length === 0 ? (
            <p className="text-parchment-dim text-sm">Nothing upcoming on the Academic Calendar.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcomingEvents.map((event) => (
                <p key={event.id} className="text-parchment text-sm truncate">
                  <span className="text-parchment-dim">
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>{" "}
                  {event.title}
                </p>
              ))}
              <Link to="/academic-calendar" className="text-gold hover:text-gold-bright text-xs mt-1">
                View Academic Calendar &rarr;
              </Link>
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="Personal Notes" icon={StickyNote}>
          <div className="flex gap-2 mb-3">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Write a note..."
              aria-label="New personal note"
              className={inputClass}
            />
            <button
              onClick={handleAddNote}
              className="text-xs border border-gold/50 text-gold hover:bg-gold/10 rounded-sm px-3"
            >
              Add
            </button>
          </div>
          {character.personalNotes.length === 0 ? (
            <p className="text-parchment-dim text-xs">No notes yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {character.personalNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-start justify-between gap-2 text-sm text-parchment border-b border-parchment-dim/10 pb-1.5"
                >
                  <span className="min-w-0 break-words">{note.text}</span>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_PERSONAL_NOTE", payload: note.id })}
                    aria-label="Remove note"
                    className="text-parchment-dim hover:text-gold-bright shrink-0"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ProfileSection>

        <ProfileSection title="Reminders" icon={Bell}>
          <div className="flex gap-2 mb-3">
            <input
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddReminder()}
              placeholder="Remind me to..."
              aria-label="New reminder"
              className={inputClass}
            />
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              aria-label="Reminder due date"
              className="bg-void/50 border border-parchment-dim/30 rounded-sm px-2 py-2 text-xs text-parchment outline-none focus:border-gold"
            />
            <button
              onClick={handleAddReminder}
              className="text-xs border border-gold/50 text-gold hover:bg-gold/10 rounded-sm px-3"
            >
              Add
            </button>
          </div>
          {character.reminders.length === 0 ? (
            <p className="text-parchment-dim text-xs">No reminders yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {character.reminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className="flex items-start justify-between gap-2 text-sm border-b border-parchment-dim/10 pb-1.5"
                >
                  <label className="flex items-start gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={reminder.completed}
                      onChange={() => dispatch({ type: "TOGGLE_REMINDER", payload: reminder.id })}
                      className="mt-1"
                    />
                    <span
                      className={`break-words ${
                        reminder.completed ? "text-parchment-dim line-through" : "text-parchment"
                      }`}
                    >
                      {reminder.text}
                      {reminder.dueDate && (
                        <span className="text-parchment-dim text-xs"> &middot; {reminder.dueDate}</span>
                      )}
                    </span>
                  </label>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_REMINDER", payload: reminder.id })}
                    aria-label="Remove reminder"
                    className="text-parchment-dim hover:text-gold-bright shrink-0"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ProfileSection>

        <ProfileSection title="Latest Grades" icon={Award}>
          {gradedCourses.length === 0 ? (
            <p className="text-parchment-dim text-sm">No grades recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {gradedCourses.map((grade) => {
                const course = getCourse(grade.courseId);
                return (
                  <Link
                    key={grade.id}
                    to="/grades"
                    className="flex items-center justify-between gap-2 text-sm hover:text-gold-bright transition-colors"
                  >
                    <span className="text-parchment truncate">{course?.name ?? grade.courseId}</span>
                    <span className="text-parchment-dim shrink-0">{grade.currentGrade}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="Library Due Dates" icon={BookOpen}>
          {upcomingDueDates.length === 0 ? (
            <p className="text-parchment-dim text-sm">No books due soon.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcomingDueDates.map((book) => (
                <Link
                  key={book.id}
                  to="/library-services"
                  className="text-sm truncate hover:text-gold-bright transition-colors"
                >
                  <span className={book.status === "Overdue" ? "text-ember" : "text-parchment-dim"}>
                    {book.status === "Overdue" ? "Overdue" : book.dueDate}
                  </span>{" "}
                  <span className="text-parchment">{book.title}</span>
                </Link>
              ))}
            </div>
          )}
        </ProfileSection>
      </div>
    </div>
  );
}
