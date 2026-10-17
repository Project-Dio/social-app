import { useState } from "react";
import {
  MessageCircle,
  SquareArrowOutUpRight,
  ThumbsUp,
  Pencil,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import man from "../images/man.jpg";
import { timeAgo } from "../utils/timeAgo";
import { updatePost, toggleLike } from "../services/postService";
import { getUser } from "../utils/tokenStorage";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const currentUser = getUser();

  const currentUserId = currentUser?._id || currentUser?.id;
  const postUserId = post.user?._id || post.user?.id;

  const isOwner =
    currentUserId && postUserId && String(currentUserId) === String(postUserId);

  // Like state
  const [liked, setLiked] = useState(() =>
    (post.likes ?? []).some(
      (id) => String(id?._id ?? id) === String(currentUserId),
    ),
  );

  const [likesCount, setLikesCount] = useState(
    post.likesCount ?? post.likes?.length ?? 0,
  );

  const [liking, setLiking] = useState(false);

  // Update state
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body || "");
  const [editImage, setEditImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Like / Unlike
  async function handleLike() {
    if (liking) return;

    setLiking(true);

    const previousLiked = liked;
    const previousLikesCount = likesCount;

    setLiked(!liked);
    setLikesCount((count) => count + (liked ? -1 : 1));

    try {
      await toggleLike(post._id || post.id);
    } catch (err) {
      setLiked(previousLiked);
      setLikesCount(previousLikesCount);
      toast.error(err.response?.data?.message || "Failed to update like.");
    } finally {
      setLiking(false);
    }
  }

  // Open edit form
  function handleEditClick(e) {
    e.stopPropagation();
    setEditBody(post.body || "");
    setEditImage(null);
    setIsEditing(true);
  }

  // Update post
  async function handleUpdate(e) {
    e.preventDefault();
    e.stopPropagation();

    if (saving) return;

    if (!editBody.trim() && !editImage && !post.image) {
      toast.error("Write something or select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("body", editBody);

    if (editImage) {
      formData.append("image", editImage);
    }

    try {
      setSaving(true);

      await updatePost(post._id || post.id, formData);

      toast.success("Post updated successfully! 🎉");
      setIsEditing(false);

      // Refresh to display the latest post data.
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={() => {
        if (!isEditing) navigate(`/${post._id || post.id}`);
      }}
      className="bg-gray-200 rounded-2xl p-4 cursor-pointer"
    >
      {/* User info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={post.user?.photo || man}
            alt=""
            className="w-9 h-9 rounded-full object-cover me-2"
          />

          <div>
            <h3>{post.user?.name}</h3>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={handleEditClick}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <Pencil size={16} />
            <span>Edit Post</span>
          </button>
        )}
      </div>

      {/* Edit form */}
      {isEditing && (
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleUpdate}
          className="my-4 space-y-3 rounded-xl bg-white p-4"
        >
          <label className="block text-sm font-medium text-gray-700">
            Post text
          </label>

          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Edit your post..."
            rows={4}
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-400"
          />

          {post.image && !editImage && (
            <div>
              <p className="mb-2 text-sm text-gray-600">Current image</p>
              <img
                src={post.image}
                alt="Current post"
                className="max-h-60 rounded-lg object-cover"
              />
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">
            {post.image ? "Replace image (optional)" : "Add image (optional)"}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditImage(e.target.files?.[0] || null)}
              className="mt-2 block w-full text-sm"
            />
          </label>

          {editImage && (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-gray-600">
                {editImage.name}
              </span>

              <button
                type="button"
                onClick={() => setEditImage(null)}
                className="text-red-500"
              >
                Remove selection
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => setIsEditing(false)}
              className="rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Post text */}
      {!isEditing && post.body && (
        <div className="mt-3 overflow-hidden">
          <p className="whitespace-pre-wrap">{post.body}</p>
        </div>
      )}

      {/* Post image */}
      {!isEditing && post.image && (
        <div className="mb-2 mt-3 w-full">
          <img
            src={post.image}
            alt=""
            className="w-full rounded-lg object-cover"
          />
        </div>
      )}

      {/* Top comment */}
      {!isEditing && post.topComment && (
        <div className="mt-3 flex items-start gap-2">
          <img
            src={post.topComment.commentCreator?.photo || man}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />

          <div className="rounded-xl bg-white px-3 py-2">
            <h4 className="text-sm font-semibold">
              {post.topComment.commentCreator?.name}
            </h4>

            <p className="text-sm text-gray-700">{post.topComment.content}</p>
          </div>
        </div>
      )}

      {/* User actions */}
      <div className="mt-3 flex gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={liking}
          className={`flex items-center gap-1 ${
            liked ? "text-blue-600" : "text-gray-700"
          }`}
        >
          <ThumbsUp fill={liked ? "currentColor" : "none"} />
          <span>{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${post._id || post.id}`);
          }}
          className="flex items-center gap-1"
        >
          <MessageCircle />
          <span>{post.commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1"
        >
          <SquareArrowOutUpRight />
          <span>{post.sharesCount}</span>
        </button>
      </div>
    </div>
  );
}
