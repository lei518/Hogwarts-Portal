import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { GameProvider } from "./context/GameContext";
import { AuthProvider } from "./context/AuthContext";
import { ProfessorAssignmentsProvider } from "./context/ProfessorAssignmentsContext";
import { ProfessorGradesProvider } from "./context/ProfessorGradesContext";
import { AssignmentBridgeSync } from "./bridges/AssignmentBridgeSync";
import { GradeBridgeSync } from "./bridges/GradeBridgeSync";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Production Hardening (Phase 6) - wraps everything, including the
        providers below, so a render error anywhere in the app falls back
        to a themed recovery screen instead of a blank page. */}
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <GameProvider>
            {/* Phase 3D - mounted here (not inside ProfessorLayout) so the
                Student Portal and Professor Portal share a single instance of
                each context. AssignmentBridgeSync/GradeBridgeSync are the only
                consumers on the Student side; see src/bridges/. */}
            <ProfessorAssignmentsProvider>
              <ProfessorGradesProvider>
                <AssignmentBridgeSync />
                <GradeBridgeSync />
                <App />
              </ProfessorGradesProvider>
            </ProfessorAssignmentsProvider>
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
