import { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser, getPlatformStats, getCourses, deleteCourse } from "../api";

export default function AdminPage({ user }) {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [s, u, c] = await Promise.all([getPlatformStats(), getUsers(), getCourses()]);
      setStats(s.data);
      setUsers(u.data);
      setCourses(c.data);
    } catch {}
  };

  const flash = (msg, type = "success") => {
    if (type === "success") setSuccess(msg); else setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      flash(`Role updated to ${newRole}`);
      loadAll();
    } catch (err) { flash(err.response?.data?.error || "Failed", "error"); }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This will remove all their enrollments, submissions, and courses.`)) return;
    try {
      await deleteUser(userId);
      flash("User deleted");
      loadAll();
    } catch (err) { flash(err.response?.data?.error || "Failed", "error"); }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!confirm(`Delete course "${title}"? This removes all enrollments, assignments, and submissions.`)) return;
    try {
      await deleteCourse(courseId);
      flash("Course deleted");
      loadAll();
    } catch (err) { flash(err.response?.data?.error || "Failed", "error"); }
  };

  if (user.role !== "admin") return <div className="empty-state"><h3>Access Denied</h3><p>Admin privileges required.</p></div>;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage users, courses, and view platform analytics</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        <button className={`tab ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>
          Dashboard
        </button>
        <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
          Users<span className="tab-badge">{users.length}</span>
        </button>
        <button className={`tab ${tab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")}>
          Courses<span className="tab-badge">{courses.length}</span>
        </button>
      </div>

      {/* ── Dashboard Tab ── */}
      {tab === "dashboard" && stats && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.total_users}</div><div className="stat-label">Total Users</div></div>
            <div className="stat-card accent"><div className="stat-value">{stats.total_students}</div><div className="stat-label">Students</div></div>
            <div className="stat-card success"><div className="stat-value">{stats.total_teachers}</div><div className="stat-label">Teachers</div></div>
            <div className="stat-card warning"><div className="stat-value">{stats.total_courses}</div><div className="stat-label">Courses</div></div>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.total_enrollments}</div><div className="stat-label">Enrollments</div></div>
            <div className="stat-card accent"><div className="stat-value">{stats.total_assignments}</div><div className="stat-label">Assignments</div></div>
            <div className="stat-card success"><div className="stat-value">{stats.total_submissions}</div><div className="stat-label">Submissions</div></div>
            <div className="stat-card warning"><div className="stat-value">{stats.total_admins}</div><div className="stat-label">Admins</div></div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {tab === "users" && (
        <div>
          <div className="search-bar">
            <span className="search-icon">&#128269;</span>
            <input type="text" placeholder="Search users by name, email, or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ padding: "0.3rem 0.5rem", border: "1.5px solid var(--gray-300)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.id !== user.id ? (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.name)}>Delete</button>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Courses Tab ── */}
      {tab === "courses" && (
        <div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Course</th><th>Instructor</th><th>Enrolled</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.title}</strong></td>
                    <td>{c.teacher?.name || "—"}</td>
                    <td>{c.enrollment_count}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCourse(c.id, c.title)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
