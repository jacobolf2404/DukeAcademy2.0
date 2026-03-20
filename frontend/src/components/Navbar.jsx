import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api";

const DUKE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Duke_Athletics_logo.svg/225px-Duke_Athletics_logo.svg.png";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      /* ignore */
    }
    setUser(null);
    navigate("/");
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path ? "active" : "";

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={DUKE_LOGO} alt="Duke" />
        DukeAcademy
      </Link>

      <div className="navbar-links">
        <Link to="/" className={isActive("/")}>Courses</Link>
        <Link to="/my-courses" className={isActive("/my-courses")}>My Courses</Link>
        {user.role === "student" && (
          <Link to="/grades" className={isActive("/grades")}>Grades</Link>
        )}
      </div>

      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="navbar-user-name">{user.name}</div>
          <div className="navbar-user-role">{user.role}</div>
        </div>
        <div className="user-avatar">{initials}</div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}
          style={{ borderColor: "rgba(255,255,255,0.25)", color: "white" }}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
