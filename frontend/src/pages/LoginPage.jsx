import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";

const DUKE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Duke_Athletics_logo.svg/225px-Duke_Athletics_logo.svg.png";

export default function LoginPage({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await register(form.name, form.email, form.password, form.role);
      } else {
        res = await login(form.email, form.password);
      }
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <img src={DUKE_LOGO} alt="Duke University" />
          <h1>DukeAcademy 2.0</h1>
          <p className="subtitle">
            {isRegister
              ? "Create your account to get started"
              : "Sign in to your learning portal"}
          </p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Smith"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@duke.edu"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                minLength={4}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label>I am a...</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Instructor</option>
                </select>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>
        </div>

        <div className="auth-toggle">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <a onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? "Sign in" : "Sign up"}
          </a>
        </div>
      </div>
    </div>
  );
}
