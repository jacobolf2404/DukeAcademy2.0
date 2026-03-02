import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";

export default function LoginPage({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>
      <p className="subtitle">
        {isRegister
          ? "Sign up for DukeAcademy 2.0"
          : "Sign in to DukeAcademy 2.0"}
      </p>

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
                placeholder="Your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
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
              placeholder="••••••••"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>

      <div className="auth-toggle">
        {isRegister ? "Already have an account? " : "Don't have an account? "}
        <a onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Sign in" : "Sign up"}
        </a>
      </div>
    </div>
  );
}
