import { useState, useEffect } from "react";
import { getMyGrades } from "../api";

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyGrades()
      .then((res) => setGrades(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byCourse = grades.reduce((acc, g) => {
    if (!acc[g.course_title]) acc[g.course_title] = [];
    acc[g.course_title].push(g);
    return acc;
  }, {});

  // Calculate overall stats
  const graded = grades.filter((g) => g.grade !== null);
  const totalEarned = graded.reduce((s, g) => s + g.grade, 0);
  const totalMax = graded.reduce((s, g) => s + g.max_points, 0);
  const avgPercent = totalMax > 0 ? ((totalEarned / totalMax) * 100).toFixed(1) : null;

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--gray-500)" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Grades</h1>
          <p>{grades.length} submission{grades.length !== 1 ? "s" : ""} across {Object.keys(byCourse).length} course{Object.keys(byCourse).length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {graded.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{avgPercent}%</div>
            <div className="stat-label">Overall Average</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-value">{graded.length}</div>
            <div className="stat-label">Graded</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{grades.length - graded.length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      {grades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128200;</div>
          <h3>No grades yet</h3>
          <p>Your grades will appear here after submitting assignments.</p>
        </div>
      ) : (
        Object.entries(byCourse).map(([courseName, courseGrades]) => (
          <div key={courseName} style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem", color: "var(--duke-navy)", fontWeight: 700 }}>{courseName}</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Assignment</th><th>Grade</th><th>Max</th><th>Status</th><th>Feedback</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {courseGrades.map((g, i) => (
                    <tr key={i}>
                      <td><strong>{g.assignment_title}</strong></td>
                      <td style={{ fontWeight: 700, color: g.grade !== null ? "var(--duke-navy)" : "var(--gray-400)" }}>
                        {g.grade !== null ? g.grade : "—"}
                      </td>
                      <td>{g.max_points}</td>
                      <td>
                        {g.grade !== null
                          ? <span className="badge badge-graded">Graded</span>
                          : <span className="badge badge-pending">Pending</span>
                        }
                      </td>
                      <td style={{ color: "var(--gray-600)", fontSize: "0.85rem" }}>{g.feedback || "—"}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{new Date(g.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
