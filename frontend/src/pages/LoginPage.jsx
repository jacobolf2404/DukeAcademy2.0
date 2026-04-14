import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import api from "../api";

export default function LoginPage({ setUser }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [verifyEmail, setVerifyEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/register/request-code", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setVerifyEmail(form.email);
      setMode("verify");
      setSuccess("Verification code sent! Check your email inbox.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register/verify", {
        email: verifyEmail,
        code: code,
      });
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "verify") {
    return (
      <div className="auth-container">
        <h1>Verify Your Email</h1>
        <p className="subtitle">Enter the 6-digit code sent to {verifyEmail}</p>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem", fontWeight: 700 }}
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={code.length !== 6 || loading}>
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <a style={{ fontSize: "0.85rem", color: "var(--gray-500)", cursor: "pointer" }}
              onClick={() => { setMode("register"); setCode(""); setError(""); setSuccess(""); }}>
              Back to registration
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1>{mode === "register" ? "Create Account" : "Welcome Back"}</h1>
      <p className="subtitle">{mode === "register" ? "Sign up for DukeAcademy 2.0" : "Sign in to DukeAcademy 2.0"}</p>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={mode === "register" ? handleRequestCode : handleLogin}>
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@duke.edu" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 characters" required minLength={6} />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "register" ? "Send Verification Code" : "Sign In"}
          </button>
        </form>
      </div>

      <div className="auth-toggle">
        {mode === "register" ? "Already have an account? " : "Don't have an account? "}
        <a onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>
          {mode === "register" ? "Sign in" : "Sign up"}
        </a>
      </div>
    </div>
  );
}
