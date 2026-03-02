import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      /* ignore */
    }
    setUser(null);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        DukeAcademy 2.0
      </Link>

      <div className="navbar-links">
        <Link to="/">Courses</Link>
        {user.role === "student" && <Link to="/my-courses">My Courses</Link>}
        {user.role === "student" && <Link to="/grades">Grades</Link>}
        {user.role === "admin" && <Link to="/admin">Admin</Link>}
      </div>

      <div className="navbar-user">
        <span>{user.name}</span>
        <span className="role-badge">{user.role}</span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
