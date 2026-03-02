import { useState, useEffect } from "react";
import { getMyGrades } from "../api";

export default function GradesPage() {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    getMyGrades()
      .then((res) => setGrades(res.data))
      .catch(() => {});
  }, []);

  // Group by course
  const byCourse = grades.reduce((acc, g) => {
    if (!acc[g.course_title]) acc[g.course_title] = [];
    acc[g.course_title].push(g);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1>My Grades</h1>
      </div>

      {grades.length === 0 ? (
        <div className="empty-state">
          <h3>No grades yet</h3>
          <p>Your grades will appear here after assignments are graded.</p>
        </div>
      ) : (
        Object.entries(byCourse).map(([courseName, courseGrades]) => (
          <div key={courseName} style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.1rem",
                marginBottom: "0.75rem",
                color: "var(--duke-navy)",
              }}
            >
              {courseName}
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
                        <td>{g.assignment_title}</td>
                        <td>
                          <strong>
                            {g.grade !== null ? g.grade : "Pending"}
                          </strong>
                        </td>
                        <td>{g.max_points}</td>
                        <td>{g.feedback || "—"}</td>
                        <td>
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
