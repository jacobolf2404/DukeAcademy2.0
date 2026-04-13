import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse, getAssignments, createAssignment, deleteAssignment,
  enroll, drop, getRoster, submitWork, getSubmissions, gradeSubmission,
  getCourseStats, getMyCourses,
} from "../api";
import SubmitModal from "../components/SubmitModal";

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [tab, setTab] = useState("assignments");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", max_points: 100 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitModalAssignment, setSubmitModalAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeEdits, setGradeEdits] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  const isTeacher = user.role === "admin" || (user.role === "teacher" && course?.teacher_id === user.id);

  useEffect(() => { loadCourse(); loadAssignments(); }, [id]);
  useEffect(() => {
    if (user.role === "student") checkEnrollment();
    if (isTeacher && course) { loadRoster(); loadStats(); }
  }, [course]);

  const loadCourse = async () => { try { setCourse((await getCourse(id)).data); } catch { navigate("/"); } };
  const loadAssignments = async () => { try { setAssignments((await getAssignments(id)).data); } catch {} };
  const checkEnrollment = async () => { try { const res = await getMyCourses(); setEnrolled(res.data.some((c) => c.id === parseInt(id))); } catch {} };
  const loadRoster = async () => { try { setRoster((await getRoster(id)).data); } catch {} };
  const loadStats = async () => { try { setStats((await getCourseStats(id)).data); } catch {} };

  const flash = (msg, type = "success") => {
    if (type === "success") setSuccess(msg); else setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleEnroll = async () => {
    try { await enroll(id); setEnrolled(true); flash("Enrolled successfully!"); loadCourse(); }
    catch (err) { flash(err.response?.data?.error || "Enrollment failed", "error"); }
  };

  const handleDrop = async () => {
    if (!confirm("Are you sure you want to drop this course?")) return;
    try { await drop(id); setEnrolled(false); flash("Dropped from course."); loadCourse(); }
    catch (err) { flash(err.response?.data?.error || "Drop failed", "error"); }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignment(id, form);
      setForm({ title: "", description: "", due_date: "", max_points: 100 });
      setShowForm(false);
      loadAssignments();
      flash("Assignment created!");
    } catch (err) { flash(err.response?.data?.error || "Failed", "error"); }
  };

  const handleDeleteAssignment = async (aid) => {
    if (!confirm("Delete this assignment and all its submissions?")) return;
    try { await deleteAssignment(aid); loadAssignments(); flash("Assignment deleted."); }
    catch (err) { flash(err.response?.data?.error || "Delete failed", "error"); }
  };

  const handleSubmitWork = async (content) => {
    try {
      await submitWork(submitModalAssignment.id, content);
      setSubmitModalAssignment(null);
      flash("Submitted successfully!");
      loadAssignments();
    } catch (err) { flash(err.response?.data?.error || "Submission failed", "error"); }
  };

  const loadSubmissions = async (aid) => {
    setSelectedAssignment(aid);
    try { setSubmissions((await getSubmissions(aid)).data); setGradeEdits({}); } catch {}
  };

  const handleGrade = async (subId) => {
    const edit = gradeEdits[subId];
    if (!edit) return;
    try {
      await gradeSubmission(subId, edit.grade, edit.feedback);
      flash("Grade saved!");
      loadSubmissions(selectedAssignment);
    } catch (err) { flash(err.response?.data?.error || "Grading failed", "error"); }
  };

  const getDueStatus = (dueDate) => {
    if (!dueDate) return null;
    return new Date(dueDate) < new Date() ? "overdue" : "upcoming";
  };

  if (!course) return <div className="main-content" style={{ textAlign: "center", padding: "4rem", color: "var(--gray-500)" }}>Loading...</div>;

  return (
    <div>
      {submitModalAssignment && (
        <SubmitModal assignment={submitModalAssignment} onSubmit={handleSubmitWork} onClose={() => setSubmitModalAssignment(null)} />
      )}

      <div className="page-header">
        <div>
          <h1>{course.title}</h1>
          <p>&#128100; {course.teacher?.name} &nbsp;&middot;&nbsp; &#127891; {course.enrollment_count} students enrolled</p>
        </div>
        {user.role === "student" && (
          enrolled ? (
            <button className="btn btn-outline btn-sm" onClick={handleDrop}>Drop Course</button>
          ) : (
            <button className="btn btn-success" onClick={handleEnroll}>Enroll in Course</button>
          )
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {course.description && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p style={{ color: "var(--gray-700)", lineHeight: 1.7 }}>{course.description}</p>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === "assignments" ? "active" : ""}`} onClick={() => setTab("assignments")}>
          Assignments<span className="tab-badge">{assignments.length}</span>
        </button>
        {isTeacher && (
          <>
            <button className={`tab ${tab === "roster" ? "active" : ""}`} onClick={() => setTab("roster")}>
              Roster<span className="tab-badge">{roster.length}</span>
            </button>
            <button className={`tab ${tab === "grading" ? "active" : ""}`} onClick={() => setTab("grading")}>Grading</button>
            <button className={`tab ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>Analytics</button>
          </>
        )}
      </div>

      {/* ── Assignments Tab ── */}
      {tab === "assignments" && (
        <div>
          {isTeacher && (
            <div style={{ marginBottom: "1rem" }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "+ New Assignment"}
              </button>
            </div>
          )}

          {showForm && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Create Assignment</h3>
              <form onSubmit={handleCreateAssignment}>
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Homework 4: Normalization" required />
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Detailed instructions for students..." />
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Due Date</label><input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                  <div className="form-group"><label>Max Points</label><input type="number" value={form.max_points} onChange={(e) => setForm({ ...form, max_points: e.target.value })} /></div>
                </div>
                <button className="btn btn-success" type="submit">Create Assignment</button>
              </form>
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">&#128203;</div><h3>No assignments yet</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Assignment</th><th>Due Date</th><th>Points</th><th>Submissions</th><th>Actions</th></tr></thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.title}</strong>
                        {a.description && <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>{a.description.slice(0, 80)}{a.description.length > 80 ? "..." : ""}</div>}
                      </td>
                      <td>
                        {a.due_date ? (
                          <span>{new Date(a.due_date).toLocaleDateString()}
                            {getDueStatus(a.due_date) === "overdue" && <span className="badge badge-overdue" style={{ marginLeft: "0.5rem" }}>Past Due</span>}
                          </span>
                        ) : "—"}
                      </td>
                      <td>{a.max_points}</td>
                      <td>{a.submission_count}</td>
                      <td style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {user.role === "student" && enrolled && (
                          <button className="btn btn-primary btn-sm" onClick={() => setSubmitModalAssignment(a)}>&#128206; Submit</button>
                        )}
                        {isTeacher && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setTab("grading"); loadSubmissions(a.id); }}>Grade</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={() => handleDeleteAssignment(a.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Roster Tab ── */}
      {tab === "roster" && isTeacher && (
        <div className="card">
          {roster.length === 0 ? (
            <div className="empty-state"><h3>No students enrolled yet</h3></div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Enrolled</th></tr></thead>
                <tbody>
                  {roster.map((s) => (
                    <tr key={s.id}><td><strong>{s.name}</strong></td><td>{s.email}</td><td>{new Date(s.enrolled_at).toLocaleDateString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Grading Tab ── */}
      {tab === "grading" && isTeacher && (
        <div>
          {!selectedAssignment ? (
            <div>
              <p style={{ color: "var(--gray-500)", marginBottom: "1rem" }}>Select an assignment to review and grade submissions:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {assignments.map((a) => (
                  <div key={a.id} className="card card-clickable" onClick={() => loadSubmissions(a.id)} style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{a.title}</strong>
                        <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{a.max_points} pts &middot; Due {a.due_date ? new Date(a.due_date).toLocaleDateString() : "N/A"}</div>
                      </div>
                      <span className="badge badge-pending">{a.submission_count} submission{a.submission_count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedAssignment(null); setSubmissions([]); setExpandedSubmission(null); }}>&#8592; Back</button>
                <div>
                  <h3 style={{ fontSize: "1rem" }}>{assignments.find((a) => a.id === selectedAssignment)?.title}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="empty-state"><h3>No submissions yet</h3></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {submissions.map((s) => {
                    const edit = gradeEdits[s.id] || { grade: s.grade ?? "", feedback: s.feedback ?? "" };
                    const isExpanded = expandedSubmission === s.id;
                    return (
                      <div key={s.id} className="card" style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                          onClick={() => setExpandedSubmission(isExpanded ? null : s.id)}>
                          <div>
                            <strong>{s.student?.name}</strong>
                            <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem", color: "var(--gray-500)" }}>{new Date(s.submitted_at).toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {s.grade !== null ? <span className="badge badge-graded">Graded: {s.grade}</span> : <span className="badge badge-pending">Ungraded</span>}
                            <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{isExpanded ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: "1rem" }}>
                            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: "1rem", fontSize: "0.88rem", whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: "'Courier New', monospace", maxHeight: "300px", overflowY: "auto", border: "1px solid var(--gray-200)" }}>
                              {s.content || "No content submitted."}
                            </div>

                            <div className="form-row" style={{ alignItems: "flex-end" }}>
                              <div className="form-group" style={{ flex: "0 0 100px" }}>
                                <label>Grade</label>
                                <input type="number" value={edit.grade} placeholder="—"
                                  onChange={(e) => setGradeEdits({ ...gradeEdits, [s.id]: { ...edit, grade: e.target.value } })} />
                              </div>
                              <div className="form-group" style={{ flex: 1 }}>
                                <label>Feedback / Comments</label>
                                <input type="text" value={edit.feedback} placeholder="Great work! Consider improving..."
                                  onChange={(e) => setGradeEdits({ ...gradeEdits, [s.id]: { ...edit, feedback: e.target.value } })} />
                              </div>
                              <div className="form-group" style={{ flex: "0 0 auto" }}>
                                <button className="btn btn-success" onClick={() => handleGrade(s.id)} disabled={!gradeEdits[s.id]} style={{ marginBottom: "0" }}>
                                  Save Grade
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Stats Tab ── */}
      {tab === "stats" && isTeacher && stats && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.enrollment_count}</div><div className="stat-label">Students</div></div>
            <div className="stat-card accent"><div className="stat-value">{stats.assignment_count}</div><div className="stat-label">Assignments</div></div>
          </div>
          {stats.assignments.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Assignment</th><th>Submissions</th><th>Completion</th><th>Avg Grade</th></tr></thead>
                <tbody>
                  {stats.assignments.map((a) => (
                    <tr key={a.assignment_id}>
                      <td><strong>{a.title}</strong></td>
                      <td>{a.submission_count}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1, height: "6px", background: "var(--gray-200)", borderRadius: "3px", maxWidth: "100px" }}>
                            <div style={{ width: `${a.completion_rate}%`, height: "100%", background: a.completion_rate >= 80 ? "var(--success)" : a.completion_rate >= 50 ? "var(--warning)" : "var(--danger)", borderRadius: "3px", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "0.8rem" }}>{a.completion_rate}%</span>
                        </div>
                      </td>
                      <td>{a.average_grade !== null ? a.average_grade : "—"}</td>
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
