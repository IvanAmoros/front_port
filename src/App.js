import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./MainPage";
import CommentsDisplay from "./components/api/CommentsDisplay";
import SkillsDisplay from "./components/api/SkillsDisplay";
import WorksDisplay from "./components/api/WorksDisplay";
import StudiesDisplay from "./components/api/StudiesDisplay";
import ProjectsDisplay from "./components/api/ProjectsDisplay";
import SkillsManager from "./components/api/SkillsManager";
import LoginPage from "./components/LoginPage";
import CookieConsentComponent from "./components/CookieConsentComponent";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <Navbar />
          </header>
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <MainPage />
                    <ProjectsDisplay />
                    <CommentsDisplay />
                    <SkillsDisplay />
                    <WorksDisplay />
                    <StudiesDisplay />
                    <CookieConsentComponent />
                  </>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/edit-skills"
                element={
                  <ProtectedRoute>
                    <SkillsManager />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          {/* Footer or other components */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
