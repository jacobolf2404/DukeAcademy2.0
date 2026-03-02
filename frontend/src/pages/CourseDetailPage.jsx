import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  getAssignments,
  createAssignment,
  enroll,
  drop,
  getRoster,
  submitWork,
  getSubmissions,
  gradeSubmission,
  getCourseStats,
  getMyCourses,
} from "../api";

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [tab, setTab] = useState("assignments");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    due_date: "",
    max_points: 100,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isTeacher =
    user.role === "admin" ||
    (user.role === "teacher" && course?.teacher_id === user.id);

  useEffect(() => {
    loadCourse();
    loadAssignments();
  }, [id]);

  useEffect(() => {
    if (user.role === "student") checkEnrollment();
    if (isTeacher && course) {
      loadRoster();
      loadStats();
    }
  }, [course]);

  const loadCourse = async () => {
    try {
      const res = await getCourse(id);
      setCourse(res.data);
    } catch {
      navigate("/");
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await getAssignments(id);
      setAssignments(res.data);
    } catch {}
  };

  const checkEnrollment = async () => {
    try {
      const res = await getMyCourses();
      setEnrolled(res.data.some((c) => c.id === parseInt(id)));
    } catch {}
  };

  const loadRoster = async () => {
    try {
      const res = await getRoster(id);
      setRoster(res.data);
    } catch {}
  };

  const loadStats = async () => {
    try {
      const res = await getCourseStats(id);
      setStats(res.data);
    } catch {}
  };

  const handleEnroll = async () => {
    try {
      await enroll(id);
      setEnrolled(true);
      setSuccess("Enrolled successfully!");
      loadCourse();
    } catch (err) {
      setError(err.response?.data?.error || "Enrollment failed");
    }
  };

  const handleDrop = async () => {
    try {
      await drop(id);
      setEnrolled(false);
      setSuccess("Dropped from course.");
      loadCourse();
    } catch (err) {
      setError(err.response?.data?.error || "Drop failed");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignment(id, assignmentForm);
      setAssignmentForm({
        title: "",
        description: "",
        due_date: "",
        max_points: 100,
      });
      setShowAssignmentForm(false);
      loadAssignments();
      setSuccess("Assignment created!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create assignment");
    }
  };

  const handleSubmit = async (assignmentId) => {
    const content = prompt("Enter your submission:");
    if (!content) return;
    try {
      await submitWork(assignmentId, content);
      setSuccess("Submitted!");
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    }
  };

  if (!course) return <div className="main-content">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{course.title}</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
            {course.teacher?.name} · {course.enrollment_count} students enrolled
          </p>
        </div>
        {user.role === "student" && (
          <div>
            {enrolled ? (
              <button className="btn btn-danger btn-sm" onClick={handleDrop}>
                Drop Course
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleEnroll}>
                Enroll
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {course.description && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p>{course.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          className={`btn ${tab === "assignments" ? "btn-primary" : "btn-outline"} btn-sm`}
          onClick={() => setTab("assignments")}
        >
          Assignments ({assignments.length})
        </button>
        {isTeacher && (
          <>
            <button
              className={`btn ${tab === "roster" ? "btn-primary" : "btn-outline"} btn-sm`}
              onClick={() => setTab("roster")}
            >
              Roster ({roster.length})
            </button>
            <button
              className={`btn ${tab === "stats" ? "btn-primary" : "btn-outline"} btn-sm`}
              onClick={() => setTab("stats")}
            >
              Stats
            </button>
          </>
        )}
      </div>

      {/* Assignments Tab */}
      {tab === "assignments" && (
        <div>
          {isTeacher && (
            <div style={{ marginBottom: "1rem" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              >
                {showAssignmentForm ? "Cancel" : "+ New Assignment"}
              </button>
            </div>
          )}

          {showAssignmentForm && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <form onSubmit={handleCreateAssignment}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Due Date</label>
                    <input
                      type="datetime-local"
                      value={assignmentForm.due_date}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          due_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Max Points</label>
                    <input
                      type="number"
                      value={assignmentForm.max_points}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          max_points: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <button className="btn btn-success" type="submit">
                  Create
                </button>
              </form>
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="empty-state">
              <h3>No assignments yet</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Points</th>
                    <th>Submissions</th>
                    {user.role === "student" && enrolled && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.title}</strong>
                        {a.description && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            {a.description.slice(0, 80)}
                          </div>
                        )}
                      </td>
                      <td>
                        {a.due_date
                          ? new Date(a.due_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{a.max_points}</td>
                      <td>{a.submission_count}</td>
                      {user.role === "student" && enrolled && (
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSubmit(a.id)}
                          >
                            Submit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Roster Tab */}
      {tab === "roster" && isTeacher && (
        <div className="card">
          {roster.length === 0 ? (
            <div className="empty-state">
              <h3>No students enrolled</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{new Date(s.enrolled_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {tab === "stats" && isTeacher && stats && (
        <div className="card">
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                {stats.enrollment_count}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                Students
              </div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                {stats.assignment_count}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                Assignments
              </div>
            </div>
          </div>

          {stats.assignments.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Submissions</th>
                    <th>Completion</th>
                    <th>Avg Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.assignments.map((a) => (
                    <tr key={a.assignment_id}>
                      <td>{a.title}</td>
                      <td>{a.submission_count}</td>
                      <td>{a.completion_rate}%</td>
                      <td>{a.average_grade ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
