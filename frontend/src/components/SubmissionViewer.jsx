import { useState } from "react";

function parseSubmission(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed.text !== undefined && parsed.attachments !== undefined) {
      return parsed;
    }
  } catch {}
  return { text: content, attachments: [] };
}

export default function SubmissionViewer({ content }) {
  const [expandedFile, setExpandedFile] = useState(null);
  const submission = parseSubmission(content);

  return (
    <div>
      {/* Text response */}
      {submission.text && (
        <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: submission.attachments.length > 0 ? "0.75rem" : 0, fontSize: "0.88rem", whiteSpace: "pre-wrap", lineHeight: 1.6, border: "1px solid var(--gray-200)", maxHeight: "250px", overflowY: "auto" }}>
          {submission.text}
        </div>
      )}

      {/* Attachments */}
      {submission.attachments.length > 0 && (
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "0.4rem" }}>
            Attachments ({submission.attachments.length})
          </div>
          {submission.attachments.map((file, i) => (
            <div key={i} style={{ border: "1px solid var(--gray-200)", borderRadius: "var(--radius-sm)", marginBottom: "0.5rem", overflow: "hidden" }}>
              {/* File header */}
              <div
                onClick={() => setExpandedFile(expandedFile === i ? null : i)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "var(--gray-50)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1rem" }}>{file.type === "text" ? "📄" : file.name.endsWith(".pdf") ? "📕" : "📎"}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{file.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {file.type === "binary" && file.data && (
                    <a href={file.data} download={file.name} onClick={(e) => e.stopPropagation()}
                      className="btn btn-outline btn-sm" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                      &#11015; Download
                    </a>
                  )}
                  <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{expandedFile === i ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded file content */}
              {expandedFile === i && (
                <div style={{ padding: "0.75rem" }}>
                  {file.type === "text" ? (
                    <pre style={{ background: "var(--gray-900)", color: "#e5e7eb", padding: "1rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", lineHeight: 1.6, overflowX: "auto", maxHeight: "350px", overflowY: "auto", margin: 0 }}>
                      {file.data}
                    </pre>
                  ) : file.name.endsWith(".pdf") && file.data ? (
                    <div>
                      <iframe src={file.data} style={{ width: "100%", height: "400px", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-sm)" }} title={file.name} />
                      <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                        <a href={file.data} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Open PDF in New Tab</a>
                      </div>
                    </div>
                  ) : file.data && file.data.startsWith("data:image") ? (
                    <img src={file.data} alt={file.name} style={{ maxWidth: "100%", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-200)" }} />
                  ) : (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--gray-500)" }}>
                      <p>Preview not available for this file type.</p>
                      {file.data && <a href={file.data} download={file.name} className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem" }}>Download File</a>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!submission.text && submission.attachments.length === 0 && (
        <div style={{ color: "var(--gray-400)", fontStyle: "italic", fontSize: "0.85rem" }}>No content submitted.</div>
      )}
    </div>
  );
}
