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

  // Group by course
  const byCourse = grades.reduce((acc, g) => {
    if (!acc[g.course_title]) acc[g.course_title] = [];
    acc[g.course_title].push(g);
    return acc;
  }, {});

  // Calculate overall stats
  const gradedItems = grades.filter((g) => g.grade !== null);
  const totalPoints = gradedItems.reduce((s, g) => s + g.grade, 0);
  const maxPoints = gradedItems.reduce((s, g) => s + g.max_points, 0);
  const overallPct = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : null;

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
          <h1>My Grades</h1>
          <p className="page-subtitle">View your grades and feedback across all courses</p>
        </div>
      </div>

      {grades.length > 0 && gradedItems.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: "1.75rem" }}>
          <div className="stat-card">
            <div className="stat-value">{overallPct}%</div>
            <div className="stat-label">Overall Average</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{grades.length}</div>
            <div className="stat-label">Submissions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{gradedItems.length}</div>
            <div className="stat-label">Graded</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{grades.length - gradedItems.length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      {grades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No grades yet</h3>
          <p>Your grades will appear here after you submit assignments and they are graded.</p>
        </div>
      ) : (
        Object.entries(byCourse).map(([courseName, courseGrades]) => (
          <div key={courseName} style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.05rem",
                marginBottom: "0.75rem",
                color: "var(--duke-navy)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              📘 {courseName}
            </h2>
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Grade</th>
                      <th>Max</th>
                      <th>Feedback</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseGrades.map((g, i) => (
                      <tr key={i}>
                        <td><strong>{g.assignment_title}</strong></td>
                        <td>
                          {g.grade !== null ? (
                            <span className="grade-badge graded">
                              {g.grade}/{g.max_points}
                            </span>
                          ) : (
                            <span className="grade-badge pending">Pending</span>
                          )}
                        </td>
                        <td>{g.max_points}</td>
                        <td style={{ maxWidth: "200px", color: "var(--gray-600)" }}>
                          {g.feedback || "—"}
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                          {new Date(g.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
