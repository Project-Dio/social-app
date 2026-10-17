import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  AtSign,
  CalendarDays,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getMyProfile } from "../services/authService";
import PostCard from "../components/PostCard";
import { getUserPosts } from "../services/postService";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyProfile();
      const body = response.data;

      const user =
        body?.data?.user ??
        body?.data?.userData ??
        body?.data?.profile ??
        body?.data ??
        body?.user ??
        body;

      setProfile(user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fullName = profile?.name || profile?.fullName || "User";
  const avatar = profile?.photo || profile?.avatar || profile?.image;
  const initial = fullName.charAt(0).toUpperCase();

  const details = [
    {
      label: "Full Name",
      value: profile?.name || profile?.fullName,
      icon: UserRound,
    },
    {
      label: "Username",
      value: profile?.username,
      icon: AtSign,
    },
    {
      label: "Email Address",
      value: profile?.email,
      icon: Mail,
    },
    {
      label: "Date of Birth",
      value: profile?.dateOfBirth
        ? String(profile.dateOfBirth).slice(0, 10)
        : null,
      icon: CalendarDays,
    },
    {
      label: "Gender",
      value: profile?.gender,
      icon: Users,
    },
  ];

  // show posts
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  useEffect(() => {
    const userId = profile?._id || profile?.id;

    if (!userId) {
      if (!loading && profile) {
        setPostsError("Couldn't find your user ID.");
        setPostsLoading(false);
      }
      return;
    }

    let active = true;

    async function fetchPosts() {
      try {
        setPostsLoading(true);
        setPostsError("");

        const response = await getUserPosts(userId);
        const data = response.data?.data?.posts ?? response.data?.data;

        if (active) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setPostsError(
            err.response?.data?.message || "Failed to load your posts.",
          );
        }
      } finally {
        if (active) setPostsLoading(false);
      }
    }

    fetchPosts();

    return () => {
      active = false;
    };
  }, [profile, loading]);
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#06349b]">YOUR ACCOUNT</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View your personal information.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProfile}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#06349b] hover:text-[#06349b] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-[#06349b]"
          />
          <p className="mt-4 font-medium text-slate-600">
            Loading your profile...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={36} className="mx-auto text-red-500" />
          <p className="mt-3 font-semibold text-slate-800">{error}</p>
          <button
            type="button"
            onClick={fetchProfile}
            className="mt-5 rounded-xl bg-[#06349b] px-5 py-3 font-semibold text-white transition hover:bg-[#052d85]"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-[#06349b] to-blue-400" />

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-3xl font-extrabold text-[#06349b] shadow-sm">
                  {initial}
                </div>
              )}

              <div className="pb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {profile?.username
                    ? `@${profile.username}`
                    : profile?.email || "Your Route Posts account"}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="mb-5 text-lg font-bold text-slate-900">
                Personal Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {details.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="rounded-lg bg-blue-50 p-2 text-[#06349b]">
                      <Icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 break-words font-semibold text-slate-800">
                        {value || "Not provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">My Posts</h2>
            <p className="mt-1 text-sm text-slate-500">
              All posts shared from your account.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-[#06349b]">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </span>
        </div>

        {postsLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-slate-500">
            Loading your posts...
          </div>
        ) : postsError ? (
          <div className="rounded-xl border border-red-100 bg-white p-6 text-center">
            <p className="text-sm text-red-600">{postsError}</p>
            <button
              type="button"
              onClick={() => {
                const userId = profile?._id || profile?.id;
                if (!userId) return;

                setPostsLoading(true);
                setPostsError("");

                getUserPosts(userId)
                  .then((response) => {
                    const data =
                      response.data?.data?.posts ?? response.data?.data;

                    setPosts(Array.isArray(data) ? data : []);
                  })
                  .catch((err) => {
                    setPostsError(
                      err.response?.data?.message ||
                        "Failed to load your posts.",
                    );
                  })
                  .finally(() => setPostsLoading(false));
              }}
              className="mt-3 font-semibold text-[#06349b] hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-lg font-bold text-slate-800">No posts yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Your posts will appear here when you share something.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id || post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
