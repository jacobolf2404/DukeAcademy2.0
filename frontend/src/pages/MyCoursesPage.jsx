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

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--gray-500)" }}>Loading...</div>;

  const title = user.role === "student" ? "My Enrolled Courses" : user.role === "teacher" ? "My Courses" : "All Courses";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128218;</div>
          <h3>No courses yet</h3>
          <p>{user.role === "student" ? "Browse the catalog to enroll in courses." : "Create a course to get started."}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Courses</Link>
        </div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <Link to={`/courses/${c.id}`} key={c.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card card-clickable">
                <h3>{c.title}</h3>
                <p>{c.description?.slice(0, 100)}{c.description?.length > 100 ? "..." : ""}</p>
                <div className="card-meta">
                  {c.teacher && <span className="card-meta-item">&#128100; {c.teacher.name}</span>}
                  <span className="card-meta-item">&#127891; {c.enrollment_count} enrolled</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
