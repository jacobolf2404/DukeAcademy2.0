import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

function SubmitModal({ assignment, onClose, onSubmitted }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await submitWork(assignment.id, content);
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit: {assignment.title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {assignment.description && (
              <p style={{ marginBottom: "1rem", color: "var(--gray-600)", fontSize: "0.9rem" }}>
                {assignment.description}
              </p>
            )}
            {assignment.due_date && (
              <p style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "var(--gray-500)" }}>
                Due: {new Date(assignment.due_date).toLocaleString()}
                {" · "}Max Points: {assignment.max_points}
              </p>
            )}
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Your Submission</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading || !content.trim()}>
              {loading ? "Submitting..." : "Submit Work"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeModal({ submission, onClose, onGraded }) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await gradeSubmission(submission.id, Number(grade), feedback);
      onGraded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Grading failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Grade Submission</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleGrade}>
          <div className="modal-body">
            <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius)", fontSize: "0.9rem" }}>
              <strong>{submission.student?.name || "Student"}</strong>
              <p style={{ marginTop: "0.5rem", color: "var(--gray-700)", whiteSpace: "pre-wrap" }}>
                {submission.content || "(empty submission)"}
              </p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--gray-500)" }}>
                Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Grade (points)</label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  required
                  placeholder="e.g. 85"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Great work! Consider expanding on..."
                rows={3}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Grade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [submitModal, setSubmitModal] = useState(null);
  const [gradeModal, setGradeModal] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);

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

  // Auto-clear alerts
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

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

  const loadSubmissions = async (assignmentId) => {
    try {
      const res = await getSubmissions(assignmentId);
      setSubmissions(res.data);
      setViewingSubmissions(assignmentId);
    } catch {}
  };

  const handleEnroll = async () => {
    try {
      await enroll(id);
      setEnrolled(true);
      setSuccess("Successfully enrolled!");
      loadCourse();
    } catch (err) {
      setError(err.response?.data?.error || "Enrollment failed");
    }
  };

  const handleDrop = async () => {
    if (!confirm("Are you sure you want to drop this course?")) return;
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
      setAssignmentForm({ title: "", description: "", due_date: "", max_points: 100 });
      setShowAssignmentForm(false);
      loadAssignments();
      loadStats();
      setSuccess("Assignment created!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create assignment");
    }
  };

  if (!course)
    return (
      <div className="loading-screen" style={{ height: "50vh" }}>
        <div className="spinner" />
      </div>
    );

  return (
    <div>
      {/* Hero header */}
      <div className="course-hero">
        <div className="course-hero-inner">
          <div>
            <Link to="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem" }}>
              ← Back to Courses
            </Link>
            <h1 style={{ marginTop: "0.5rem" }}>{course.title}</h1>
            <div className="course-hero-meta">
              <span>👤 {course.teacher?.name || "TBD"}</span>
              <span>🎓 {course.enrollment_count} student{course.enrollment_count !== 1 ? "s" : ""}</span>
              <span>📝 {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          {user.role === "student" && (
            <div style={{ flexShrink: 0, marginTop: "0.5rem" }}>
              {enrolled ? (
                <button
                  className="btn btn-danger"
                  onClick={handleDrop}
                  style={{ background: "rgba(220,38,38,0.9)" }}
                >
                  Drop Course
                </button>
              ) : (
                <button
                  className="btn btn-lg"
                  onClick={handleEnroll}
                  style={{ background: "white", color: "var(--duke-blue)", fontWeight: 700 }}
                >
                  Enroll Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {course.description && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p style={{ color: "var(--gray-700)", lineHeight: 1.7 }}>{course.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${tab === "assignments" ? "active" : ""}`}
          onClick={() => setTab("assignments")}
        >
          Assignments<span className="tab-count">{assignments.length}</span>
        </button>
        {isTeacher && (
          <>
            <button
              className={`tab ${tab === "roster" ? "active" : ""}`}
              onClick={() => setTab("roster")}
            >
              Roster<span className="tab-count">{roster.length}</span>
            </button>
            <button
              className={`tab ${tab === "stats" ? "active" : ""}`}
              onClick={() => setTab("stats")}
            >
              Statistics
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
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>New Assignment</h3>
              <form onSubmit={handleCreateAssignment}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                    placeholder="e.g. Homework 3: SQL Queries"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                    placeholder="Instructions for the assignment..."
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="datetime-local"
                      value={assignmentForm.due_date}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Points</label>
                    <input
                      type="number"
                      value={assignmentForm.max_points}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, max_points: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>
                <button className="btn btn-success" type="submit">
                  Create Assignment
                </button>
              </form>
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No assignments yet</h3>
              <p>
                {isTeacher
                  ? "Create the first assignment for this course."
                  : "Assignments will appear here when posted."}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Due Date</th>
                      <th>Points</th>
                      {isTeacher && <th>Submissions</th>}
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => {
                      const overdue = a.due_date && new Date(a.due_date) < new Date();
                      return (
                        <tr key={a.id}>
                          <td>
                            <strong>{a.title}</strong>
                            {a.description && (
                              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.15rem" }}>
                                {a.description.slice(0, 80)}{a.description.length > 80 ? "..." : ""}
                              </div>
                            )}
                          </td>
                          <td>
                            {a.due_date ? (
                              <span style={{ color: overdue ? "var(--danger)" : "inherit" }}>
                                {new Date(a.due_date).toLocaleDateString()}
                                {overdue && <span style={{ fontSize: "0.75rem" }}> (past)</span>}
                              </span>
                            ) : "—"}
                          </td>
                          <td>{a.max_points}</td>
                          {isTeacher && (
                            <td>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => loadSubmissions(a.id)}
                              >
                                {a.submission_count} submitted →
                              </button>
                            </td>
                          )}
                          <td style={{ textAlign: "right" }}>
                            {user.role === "student" && enrolled && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setSubmitModal(a)}
                              >
                                Submit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submissions panel for teacher */}
          {viewingSubmissions && isTeacher && (
            <div className="card" style={{ marginTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem" }}>
                  Submissions for: {assignments.find((a) => a.id === viewingSubmissions)?.title}
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setViewingSubmissions(null)}>
                  Close ✕
                </button>
              </div>
              {submissions.length === 0 ? (
                <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>No submissions yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Submitted</th>
                        <th>Content</th>
                        <th>Grade</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.student?.name || "—"}</strong>
                            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                              {s.student?.email}
                            </div>
                          </td>
                          <td style={{ fontSize: "0.85rem" }}>
                            {new Date(s.submitted_at).toLocaleString()}
                          </td>
                          <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.content || "(empty)"}
                          </td>
                          <td>
                            {s.grade != null ? (
                              <span className="grade-badge graded">{s.grade}</span>
                            ) : (
                              <span className="grade-badge pending">Pending</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setGradeModal(s)}
                            >
                              {s.grade != null ? "Edit Grade" : "Grade"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Roster Tab */}
      {tab === "roster" && isTeacher && (
        <div className="card">
          {roster.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No students enrolled</h3>
              <p>Students will appear here once they enroll.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
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
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.enrollment_count}</div>
              <div className="stat-label">Students Enrolled</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.assignment_count}</div>
              <div className="stat-label">Assignments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.assignments.length > 0
                  ? Math.round(
                      stats.assignments.reduce((s, a) => s + a.completion_rate, 0) /
                        stats.assignments.length
                    )
                  : 0}%
              </div>
              <div className="stat-label">Avg Completion</div>
            </div>
          </div>

          {stats.assignments.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Per-Assignment Breakdown</h3>
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
                        <td><strong>{a.title}</strong></td>
                        <td>{a.submission_count}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ flex: 1, maxWidth: "80px", height: "6px", background: "var(--gray-200)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${a.completion_rate}%`, height: "100%", background: a.completion_rate >= 75 ? "var(--success)" : a.completion_rate >= 50 ? "var(--warning)" : "var(--danger)", borderRadius: "3px" }} />
                            </div>
                            <span style={{ fontSize: "0.85rem" }}>{a.completion_rate}%</span>
                          </div>
                        </td>
                        <td>{a.average_grade != null ? a.average_grade : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {submitModal && (
        <SubmitModal
          assignment={submitModal}
          onClose={() => setSubmitModal(null)}
          onSubmitted={() => {
            loadAssignments();
            setSuccess("Submission received!");
          }}
        />
      )}
      {gradeModal && (
        <GradeModal
          submission={gradeModal}
          onClose={() => setGradeModal(null)}
          onGraded={() => {
            loadSubmissions(viewingSubmissions);
            loadStats();
            setSuccess("Grade saved!");
          }}
        />
      )}
    </div>
  );
}
