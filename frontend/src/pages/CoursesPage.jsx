import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, createCourse } from "../api";

export default function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch {
      setError("Failed to load courses");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCourse(form);
      setForm({ title: "", description: "" });
      setShowForm(false);
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create course");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Course Catalog</h1>
        {(user.role === "teacher" || user.role === "admin") && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ New Course"}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Course Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. CompSci 316: Intro to Database Systems"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Course description..."
                rows={3}
              />
            </div>
            <button className="btn btn-success" type="submit">
              Create Course
            </button>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>Courses will appear here once created.</p>
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
                <p>{c.description?.slice(0, 120)}...</p>
                <div className="card-meta">
                  <span>Instructor: {c.teacher?.name || "TBD"}</span>
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
