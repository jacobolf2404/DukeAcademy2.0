import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, createCourse } from "../api";

export default function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Course Catalog</h1>
          <p className="page-subtitle">
            {courses.length} course{courses.length !== 1 ? "s" : ""} available
          </p>
        </div>
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
          <h3 style={{ marginBottom: "1rem" }}>Create a New Course</h3>
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
                placeholder="Describe what students will learn in this course..."
                rows={3}
              />
            </div>
            <button className="btn btn-success" type="submit">
              Create Course
            </button>
          </form>
        </div>
      )}

      {courses.length > 3 && (
        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <input
            type="text"
            placeholder="Search courses by title, description, or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "480px" }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>{search ? "No matching courses" : "No courses yet"}</h3>
          <p>
            {search
              ? "Try a different search term."
              : "Courses will appear here once created."}
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((c) => (
            <Link
              to={`/courses/${c.id}`}
              key={c.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card card-hover course-card-accent">
                <h3>{c.title}</h3>
                <p>
                  {c.description
                    ? c.description.length > 120
                      ? c.description.slice(0, 120) + "..."
                      : c.description
                    : "No description provided."}
                </p>
                <div className="card-meta">
                  <span className="card-meta-item">
                    👤 {c.teacher?.name || "TBD"}
                  </span>
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
