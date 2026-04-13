import { useState } from "react";

export default function SubmitModal({ assignment, onSubmit, onClose }) {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setContent((prev) => prev + (prev ? "\n\n" : "") + `[Attached: ${file.name}]\n\n` + ev.target.result);
    };
    if (file.type.startsWith("text/") || file.name.endsWith(".py") || file.name.endsWith(".sql") || file.name.endsWith(".java") || file.name.endsWith(".js") || file.name.endsWith(".json") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      setContent((prev) => prev + (prev ? "\n\n" : "") + `[Attached file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <div>
            <h2 style={{ marginBottom: "0.15rem" }}>Submit Assignment</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>{assignment.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "var(--gray-400)", padding: "0.25rem" }}>&times;</button>
        </div>

        {assignment.description && (
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--gray-600)", borderLeft: "3px solid var(--duke-blue)" }}>
            {assignment.description}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", fontSize: "0.8rem", color: "var(--gray-500)" }}>
          {assignment.due_date && <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>}
          <span>Max: {assignment.max_points} pts</span>
        </div>

        <div className="form-group">
          <label>Your Submission</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your answer here, paste code, or attach a file below..."
            rows={10}
            style={{ fontFamily: content.includes("[Attached") ? "inherit" : "'Inter', monospace", fontSize: "0.88rem", lineHeight: "1.6" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", marginBottom: 0 }}>
            &#128206; Attach File
            <input type="file" onChange={handleFileSelect} style={{ display: "none" }} accept=".txt,.py,.sql,.java,.js,.jsx,.json,.md,.csv,.pdf,.docx" />
          </label>
          {fileName && <span style={{ fontSize: "0.8rem", color: "var(--gray-600)" }}>&#9989; {fileName}</span>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={!content.trim() || loading}>
            {loading ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
