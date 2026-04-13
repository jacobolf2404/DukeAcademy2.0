import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard, getMyCourses } from "../api";

export default function DashboardPage({ user }) {
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getMyCourses()])
      .then(([d, c]) => { setData(d.data); setCourses(c.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--gray-500)" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div>;

  const now = new Date();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>Here's what's happening across your courses</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{data?.enrolled_count || 0}</div><div className="stat-label">Courses</div></div>
        <div className="stat-card accent"><div className="stat-value">{data?.upcoming_assignments?.filter(a => !a.submitted).length || 0}</div><div className="stat-label">Due Soon</div></div>
        <div className="stat-card success"><div className="stat-value">{data?.recent_grades?.length || 0}</div><div className="stat-label">Recent Grades</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {/* Upcoming assignments */}
        <div className="card" style={{ gridColumn: "1" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--duke-navy)" }}>&#128203; Upcoming Assignments</h3>
          {(!data?.upcoming_assignments || data.upcoming_assignments.length === 0) ? (
            <p style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>No assignments right now. Nice!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {data.upcoming_assignments.slice(0, 6).map((a) => {
                const due = a.due_date ? new Date(a.due_date) : null;
                const overdue = due && due < now;
                const dueSoon = due && !overdue && (due - now) / (1000*60*60*24) < 3;
                return (
                  <Link to={`/courses/${a.course_id}`} key={a.id} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-200)", transition: "var(--transition)" }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--gray-200)"}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{a.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{a.course_title}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {a.submitted ? (
                          a.grade !== null
                            ? <span className="badge badge-graded">{a.grade}/{a.max_points}</span>
                            : <span className="badge badge-pending">Submitted</span>
                        ) : overdue ? (
                          <span className="badge badge-overdue">Past Due</span>
                        ) : dueSoon ? (
                          <span className="badge" style={{ background: "#FEF3C7", color: "#D97706" }}>Due Soon</span>
                        ) : due ? (
                          <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{due.toLocaleDateString()}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent grades */}
        <div className="card" style={{ gridColumn: "2" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--duke-navy)" }}>&#128200; Recent Grades</h3>
          {(!data?.recent_grades || data.recent_grades.length === 0) ? (
            <p style={{ color: "var(--gray-400)", fontSize: "0.85rem" }}>No grades yet. Keep submitting!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {data.recent_grades.map((g, i) => {
                const pct = (g.grade / g.max_points) * 100;
                return (
                  <div key={i} style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-200)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{g.assignment_title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{g.course_title}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: pct >= 90 ? "var(--success)" : pct >= 70 ? "var(--warning)" : "var(--danger)" }}>
                        {g.grade}/{g.max_points}
                      </div>
                    </div>
                    <div style={{ height: "4px", background: "var(--gray-200)", borderRadius: "2px" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "2px", background: pct >= 90 ? "var(--success)" : pct >= 70 ? "var(--warning)" : "var(--danger)" }} />
                    </div>
                    {g.feedback && <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: "0.3rem", fontStyle: "italic" }}>"{g.feedback}"</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enrolled courses */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", color: "var(--duke-navy)" }}>My Courses</h2>
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
    </div>
  );
}
