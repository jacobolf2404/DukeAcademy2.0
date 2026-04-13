import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, createCourse } from "../api";

export default function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadCourses(); }, []);

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
      setSuccess("Course created successfully!");
      loadCourses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create course");
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.teacher?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Course Catalog</h1>
          <p>{courses.length} course{courses.length !== 1 ? "s" : ""} available</p>
        </div>
        {(user.role === "teacher" || user.role === "admin") && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Course"}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Create New Course</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Course Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. CompSci 316: Intro to Database Systems" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief course description..." rows={3} />
            </div>
            <button className="btn btn-success" type="submit">Create Course</button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <span className="search-icon">&#128269;</span>
        <input type="text" placeholder="Search courses by title, instructor, or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128218;</div>
          <h3>{search ? "No matching courses" : "No courses yet"}</h3>
          <p>{search ? "Try a different search term." : "Courses will appear here once created."}</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((c) => (
            <Link to={`/courses/${c.id}`} key={c.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card card-clickable">
                <h3>{c.title}</h3>
                <p>{c.description?.length > 120 ? c.description.slice(0, 120) + "..." : c.description}</p>
                <div className="card-meta">
                  <span className="card-meta-item">&#128100; {c.teacher?.name || "TBD"}</span>
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
