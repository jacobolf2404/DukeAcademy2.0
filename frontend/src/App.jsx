import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getMe } from "./api";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import GradesPage from "./pages/GradesPage";

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
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading DukeAcademy...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage setUser={setUser} />;
  }

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<CoursesPage user={user} />} />
          <Route
            path="/courses/:id"
            element={<CourseDetailPage user={user} />}
          />
          <Route
            path="/my-courses"
            element={<MyCoursesPage user={user} />}
          />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <footer className="footer">
        Duke University &middot; CompSci 316 &middot; DukeAcademy 2.0
      </footer>
    </div>
  );
}
