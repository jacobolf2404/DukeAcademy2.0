import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    setUser(null);
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">DA</span>
        DukeAcademy 2.0
      </Link>

      <div className="navbar-links">
        <Link to="/" className={isActive("/")}>Courses</Link>
        {user.role === "student" && (
          <>
            <Link to="/my-courses" className={isActive("/my-courses")}>My Courses</Link>
            <Link to="/grades" className={isActive("/grades")}>Grades</Link>
          </>
        )}
        {user.role === "teacher" && (
          <Link to="/my-courses" className={isActive("/my-courses")}>My Courses</Link>
        )}
        {user.role === "admin" && (
          <Link to="/admin" className={isActive("/admin")}>Admin Panel</Link>
        )}
      </div>

      <div className="navbar-user">
        <span>{user.name}</span>
        <span className={`role-badge ${user.role}`}>{user.role}</span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
