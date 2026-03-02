import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../api";

export default function MyCoursesPage({ user }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getMyCourses()
      .then((res) => setCourses(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>
          {user.role === "student"
            ? "My Enrolled Courses"
            : user.role === "teacher"
            ? "My Courses"
            : "All Courses"}
        </h1>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>
            {user.role === "student"
              ? "Browse the course catalog to enroll."
              : "Create a course to get started."}
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Browse Courses
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
              <div className="card" style={{ cursor: "pointer" }}>
                <h3>{c.title}</h3>
                <p>{c.description?.slice(0, 100)}</p>
                <div className="card-meta">
                  {c.teacher && <span>Instructor: {c.teacher.name}</span>}
                  <span>{c.enrollment_count} enrolled</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
