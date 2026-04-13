import { useState } from "react";

export default function SubmitModal({ assignment, onSubmit, onClose }) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    if (file.type.startsWith("text/") || /\.(py|sql|java|js|jsx|json|md|csv|txt|html|css|c|cpp|h)$/i.test(file.name)) {
      reader.onload = (ev) => {
        setFiles((prev) => [...prev, { name: file.name, type: "text", data: ev.target.result, size: file.size }]);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        setFiles((prev) => [...prev, { name: file.name, type: "binary", data: ev.target.result, size: file.size, mime: file.type }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    setLoading(true);

    // Build submission payload: text + file metadata
    const attachments = files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      mime: f.mime || "text/plain",
      data: f.data,
    }));

    const payload = JSON.stringify({
      text: content,
      attachments: attachments,
    });

    try {
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
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
          <label>Your Response</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your answer here..."
            rows={8}
            style={{ fontSize: "0.88rem", lineHeight: "1.6" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", marginBottom: 0 }}>
            &#128206; Attach File
            <input type="file" onChange={handleFileSelect} style={{ display: "none" }} />
          </label>
          <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginLeft: "0.75rem" }}>PDF, code files, text, images</span>
        </div>

        {files.length > 0 && (
          <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem", border: "1px solid var(--gray-200)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{f.type === "text" ? "📄" : "📎"}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>({(f.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem" }}>&times;</button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={(!content.trim() && files.length === 0) || loading}>
            {loading ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
