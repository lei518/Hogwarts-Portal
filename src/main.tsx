import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { GameProvider } from "./context/GameContext";
import { AuthProvider } from "./context/AuthContext";
import { OwleryProvider } from "./context/OwleryContext";
import { AcademicDataProvider } from "./context/AcademicDataContext";
import { ProfessorAssignmentsProvider } from "./context/ProfessorAssignmentsContext";
import { ProfessorGradesProvider } from "./context/ProfessorGradesContext";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { InactivityManager } from "./auth/InactivityManager";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Production Hardening (Phase 6) - wraps everything, including the
        providers below, so a render error anywhere in the app falls back
        to a themed recovery screen instead of a blank page. */}
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          {/* Session Management (Phase 6K) - the single centralized
              inactivity/session timer, mounted once here so every
              authenticated portal (Student, Professor, Admin) benefits
              without any of them owning a timer of their own. See
              src/auth/InactivityManager.tsx. */}
          <InactivityManager />
          {/* Phase 5 - Owlery. Mounted here, not inside GameProvider, so
              every role (Professor/Admin/the four new staff roles - none of
              which have a Character) gets an inbox too, not just students. */}
          <OwleryProvider>
            <GameProvider>
              {/* Phase 2 - inside GameProvider (not outside, as Phase 7A had
                  it) because auto-enrollment needs the signed-in student's
                  own Character.year; see context/AcademicDataContext.tsx's
                  own comment. Courses/Assignments/Announcements/Enrollments/
                  Submissions are fetched here, once, for every portal to
                  share. */}
              <AcademicDataProvider>
                {/* Phase 3D - mounted here (not inside ProfessorLayout) so the
                    Student Portal and Professor Portal share a single instance
                    of each context. */}
                <ProfessorAssignmentsProvider>
                  <ProfessorGradesProvider>
                    <App />
                  </ProfessorGradesProvider>
                </ProfessorAssignmentsProvider>
              </AcademicDataProvider>
            </GameProvider>
          </OwleryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
