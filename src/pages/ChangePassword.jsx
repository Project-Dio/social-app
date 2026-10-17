import { useState } from "react";
import { KeyRound, LockKeyhole, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { changePassword } from "../services/authService";
import { getUser, saveAuth } from "../utils/tokenStorage";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !newPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password === newPassword) {
      toast.error("Your new password must be different.");
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword(password, newPassword);

      // The API returns a refreshed authentication token.
      const result = response.data?.data ?? response.data;
      const token = result?.token;

      if (token) {
        saveAuth(token, getUser());
      }

      toast.success("Password changed successfully!");

      setPassword("");
      setNewPassword("");

      navigate("/", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#06349b] focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-[80vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#06349b]"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#06349b]">
            <LockKeyhole size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Update your password to keep your account secure.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Current Password
              </label>

              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                New Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Choose a strong password that you have not used before.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#06349b] py-3.5 font-bold text-white transition hover:bg-[#052d85] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
