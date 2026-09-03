import { Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing/Landing";
import { Authentication } from "./pages/Authentication/Authentication";
import { SignIn } from "./pages/SignIn/SignIn";
import { CreateAccount } from "./pages/CreateAccount/CreateAccount";
import { CharacterCreation } from "./pages/CharacterCreation/CharacterCreation";
import { AcceptanceLetter } from "./pages/AcceptanceLetter/AcceptanceLetter";
import { WandPage } from "./pages/Wand/Wand";
import { HogwartsExpress } from "./pages/HogwartsExpress/HogwartsExpress";
import { Sorting } from "./pages/Sorting/Sorting";
import { CommonRoom } from "./pages/CommonRoom/CommonRoom";
import { PatronusPage } from "./pages/Patronus/Patronus";
import { OwlPostInboxPage } from "./pages/OwlPost/OwlPost";
import { CoursesPage } from "./pages/Courses/Courses";
import { CourseDetailPage } from "./pages/Courses/CourseDetail";
import { SchedulePage } from "./pages/Schedule/Schedule";
import { AcademicProgressPage } from "./pages/AcademicProgress/AcademicProgress";
import { AssignmentsPage } from "./pages/Assignments/Assignments";
import { AssignmentDetailPage } from "./pages/Assignments/AssignmentDetail";
import { GradesPage } from "./pages/Grades/Grades";
import { TranscriptPage } from "./pages/Transcript/Transcript";
import { AcademicStandingPage } from "./pages/AcademicStanding/AcademicStanding";
import { SemesterSummaryPage } from "./pages/SemesterSummary/SemesterSummary";
import { CharacterPage } from "./pages/Character/Character";
import { Tutorial } from "./pages/Tutorial/Tutorial";
import { GameLayout } from "./components/layout/GameLayout";
import { JourneyGate } from "./journey/JourneyGate";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { MapPage } from "./pages/Map/Map";
import { LocationDetailPage } from "./pages/Map/LocationDetail";
import { SpellsPage } from "./pages/Spells/Spells";
import { PotionsPage } from "./pages/Potions/Potions";
import { InventoryPage } from "./pages/Inventory/Inventory";
import { LibraryPage } from "./pages/Library/Library";
import { StudentsPage } from "./pages/Students/Students";
import { StudentProfilePage } from "./pages/Students/StudentProfile";
import { ProfessorsPage } from "./pages/Professors/Professors";
import { ProfessorDetailPage } from "./pages/Professors/ProfessorDetail";
import { AnnouncementsPage } from "./pages/Announcements/Announcements";
import { PoliciesPage } from "./pages/Policies/Policies";
import { AcademicCalendarPage } from "./pages/AcademicCalendar/AcademicCalendar";
import { HospitalWingPage } from "./pages/HospitalWing/HospitalWing";
import { OwleryServicesPage } from "./pages/OwleryServices/OwleryServices";
import { LibraryServicesPage } from "./pages/LibraryServices/LibraryServices";
import { HogsmeadeServicesPage } from "./pages/HogsmeadeServices/HogsmeadeServices";
import { LostAndFoundPage } from "./pages/LostAndFound/LostAndFound";
import { StudentSupportPage } from "./pages/StudentSupport/StudentSupport";
import { HouseCupPage } from "./pages/House/HouseCup";
import { QuestLogPage } from "./pages/Adventure/Adventure";
import { AchievementsPage } from "./pages/Achievements/Achievements";
import { SettingsPage } from "./pages/Settings/Settings";
import { PlaceholderPage } from "./components/layout/PlaceholderPage";

function App() {
  return (
    <Routes>
      {/* Player Journey Manager: re-validates every navigation against
          progress so pages can't be reached out of order. */}
      <Route element={<JourneyGate />}>
        <Route path="/" element={<Landing />} />
        <Route path="/authenticate" element={<Authentication />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Onboarding pipeline */}
        <Route path="/create-character" element={<CharacterCreation />} />
        <Route path="/acceptance-letter" element={<AcceptanceLetter />} />
        <Route path="/wand" element={<WandPage />} />
        <Route path="/hogwarts-express" element={<HogwartsExpress />} />
        <Route path="/sorting" element={<Sorting />} />
        <Route path="/common-room" element={<CommonRoom />} />
        <Route path="/tutorial" element={<Tutorial />} />

        {/* Hogwarts Student Portal: sidebar (desktop) / bottom nav (mobile) */}
        <Route element={<GameLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/map/:locationId" element={<LocationDetailPage />} />
          <Route path="/character" element={<CharacterPage />} />
          <Route path="/house" element={<HouseCupPage />} />
          {/* Year 5+ Portal feature - not part of onboarding. */}
          <Route path="/patronus" element={<PatronusPage />} />
          {/* Global (header icon), not part of the sectioned nav model. */}
          <Route path="/owl-post" element={<OwlPostInboxPage />} />

          {/* Academics foundation */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/academic-progress" element={<AcademicProgressPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:assignmentId" element={<AssignmentDetailPage />} />

          {/* Grades & Academic Records - standalone module, see CLAUDE.md */}
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/transcript" element={<TranscriptPage />} />
          <Route path="/academic-standing" element={<AcademicStandingPage />} />
          <Route path="/semester-summary" element={<SemesterSummaryPage />} />

          {/* Phase 4 */}
          <Route path="/spells" element={<SpellsPage />} />
          <Route path="/potions" element={<PotionsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />

          {/* Phase 5 */}
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />

          {/* Resources foundation */}
          <Route path="/professors" element={<ProfessorsPage />} />
          <Route path="/professors/:professorId" element={<ProfessorDetailPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/academic-calendar" element={<AcademicCalendarPage />} />

          {/* Student Services - standalone module, see CLAUDE.md */}
          <Route path="/hospital-wing" element={<HospitalWingPage />} />
          <Route path="/owlery-services" element={<OwleryServicesPage />} />
          <Route path="/library-services" element={<LibraryServicesPage />} />
          <Route path="/hogsmeade-services" element={<HogsmeadeServicesPage />} />
          <Route path="/lost-and-found" element={<LostAndFoundPage />} />
          <Route path="/student-support" element={<StudentSupportPage />} />

          {/* Student Planner - route name predates the Campus Life rework. */}
          <Route path="/adventure" element={<QuestLogPage />} />

          {/* Phase 7 */}
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="*"
          element={<PlaceholderPage title="Page Not Found" phase="a future phase" />}
        />
      </Route>
    </Routes>
  );
}

export default App;

