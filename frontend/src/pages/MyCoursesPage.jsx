import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../api";

export default function MyCoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses()
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const title =
    user.role === "student"
      ? "My Enrolled Courses"
      : user.role === "teacher"
      ? "My Courses"
      : "All Courses";

  const subtitle =
    user.role === "student"
      ? "Courses you are currently enrolled in"
      : user.role === "teacher"
      ? "Courses you are teaching"
      : "All courses on the platform";

  if (loading)
    return (
      <div className="loading-screen" style={{ height: "40vh" }}>
        <div className="spinner" />
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No courses yet</h3>
          <p>
            {user.role === "student"
              ? "Browse the course catalog to find courses to enroll in."
              : "Create a course from the catalog page to get started."}
          </p>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ marginTop: "0.5rem" }}
          >
            Browse Course Catalog
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <Link
              to={`/courses/${c.id}`}
              key={c.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card card-hover course-card-accent">
                <h3>{c.title}</h3>
                <p>
                  {c.description
                    ? c.description.length > 100
                      ? c.description.slice(0, 100) + "..."
                      : c.description
                    : "No description."}
                </p>
                <div className="card-meta">
                  {c.teacher && (
                    <span className="card-meta-item">
                      👤 {c.teacher.name}
                    </span>
                  )}
                  <span className="card-meta-item">
                    🎓 {c.enrollment_count} enrolled
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
