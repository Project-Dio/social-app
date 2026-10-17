import { House, LogOut, Newspaper, User, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../utils/tokenStorage";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="shadow bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div id="logo">
            <h2 className="font-bold text-xl">Route Posts</h2>
          </div>

          <ul className="flex flex-wrap items-center gap-6">
            <li className="flex items-center gap-1">
              <House size={18} />
              <Link to="/">Home</Link>
            </li>

            <li className="flex items-center gap-1">
              <User size={18} />
              <Link to="/profile" className="transition hover:text-[#06349b]">
                Profile
              </Link>
            </li>

            <li className="flex items-center gap-2">
              <KeyRound size={18} className="text-[#06349b]" />
              <Link
                to="/change-password"
                className="font-medium transition hover:text-[#06349b]"
              >
                Change Password
              </Link>
            </li>
          </ul>

          <div id="log-out" className="flex cursor-pointer items-center gap-2">
            <button onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
