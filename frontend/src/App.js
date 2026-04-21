import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import StudentsPage from "@/pages/StudentsPage";
import InfosPage from "@/pages/InfosPage";
import InfoDetailPage from "@/pages/InfoDetailPage";
import EventsPage from "@/pages/EventsPage";
import MessagesPage from "@/pages/MessagesPage";

function Shell({ children }) {
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etudiants"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/infos" element={<InfosPage />} />
            <Route path="/infos/:slug" element={<InfoDetailPage />} />
            <Route path="/evenements" element={<EventsPage />} />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AuthProvider>
  );
}
