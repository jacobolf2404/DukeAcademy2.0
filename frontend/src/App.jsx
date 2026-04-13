import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getMe } from "./api";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import GradesPage from "./pages/GradesPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--gray-500)", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ fontSize: "2rem" }}>&#128218;</div>
        <div>Loading DukeAcademy 2.0...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <LoginPage setUser={setUser} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<CoursesPage user={user} />} />
          <Route path="/courses/:id" element={<CourseDetailPage user={user} />} />
          <Route path="/my-courses" element={<MyCoursesPage user={user} />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
