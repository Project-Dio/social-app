import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MessageCircle,
  SquareArrowOutUpRight,
  ThumbsUp,
  X,
  Trash2,
  Pencil,
  ImagePlus,
} from "lucide-react";

import {
  getPostById,
  getPostComments,
  toggleLike,
  createComment,
  deletePost,
  updatePost,
  updateComment,
  deleteComment,
} from "../services/postService";

import { getUser } from "../utils/tokenStorage";
import { timeAgo } from "../utils/timeAgo";
import man from "../images/man.jpg";
import toast from "react-hot-toast";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const currentUser = getUser();
  const currentUserId = String(currentUser?._id ?? currentUser?.id ?? "");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");

  // Edit post state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostImage, setEditPostImage] = useState(null);
  const [updatingPost, setUpdatingPost] = useState(false);

  // Edit/delete comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [updatingComment, setUpdatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const getPostData = (response) =>
    response?.data?.data?.post ??
    response?.data?.data?.postDetails ??
    response?.data?.data;

  const getCommentData = (response) =>
    response?.data?.data?.comments ?? response?.data?.data;

  const getId = (item) => String(item?._id ?? item?.id ?? "");

  const getAuthor = (item) =>
    item?.commentCreator ?? item?.user ?? item?.author;

  const getCommentText = (comment) =>
    comment?.content ?? comment?.body ?? comment?.text ?? "";

  const getPostText = (item) => item?.body ?? item?.content ?? "";

  const getPostOwnerId = (item) => {
    const owner = item?.user ?? item?.userId ?? item?.owner ?? item?.createdBy;

    return String(
      typeof owner === "object"
        ? (owner?._id ?? owner?.id ?? "")
        : (owner ?? ""),
    );
  };

  const getCommentOwnerId = (comment) => {
    const author = getAuthor(comment);

    return String(
      typeof author === "object"
        ? (author?._id ?? author?.id ?? "")
        : (author ?? ""),
    );
  };

  const postOwnerId = getPostOwnerId(post);
  const isOwner =
    Boolean(currentUserId) &&
    Boolean(postOwnerId) &&
    currentUserId === postOwnerId;

  const liked = Boolean(
    post?.likes?.some((like) => {
      const likeId = typeof like === "object" ? (like?._id ?? like?.id) : like;

      return String(likeId ?? "") === currentUserId;
    }),
  );

  const likesCount = post?.likesCount ?? post?.likes?.length ?? 0;

  const commentsCount = post?.commentsCount ?? comments.length;

  // Load post details
  useEffect(() => {
    let active = true;

    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPostById(postId);
        const postData = getPostData(response);

        if (!postData || typeof postData !== "object") {
          throw new Error("Post not found");
        }

        if (active) {
          setPost(postData);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || err.message || "Failed to load post",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [postId]);

  // Load comments
  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const response = await getPostComments(postId);
      const data = getCommentData(response);

      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleComments = async () => {
    const nextValue = !showComments;
    setShowComments(nextValue);

    if (nextValue) {
      await loadComments();
    }
  };

  // Like/unlike post
  const handleLike = async () => {
    if (liking || !post) return;

    if (!currentUserId) {
      toast.error("Please log in to like this post");
      return;
    }

    const previousPost = post;

    const currentLikes = Array.isArray(post.likes) ? post.likes : [];

    const nextLikes = liked
      ? currentLikes.filter((like) => {
          const likeId =
            typeof like === "object" ? (like?._id ?? like?.id) : like;

          return String(likeId ?? "") !== currentUserId;
        })
      : [...currentLikes, currentUserId];

    setPost({
      ...post,
      likes: nextLikes,
      likesCount: Math.max(0, likesCount + (liked ? -1 : 1)),
    });

    try {
      setLiking(true);
      await toggleLike(postId);

      const response = await getPostById(postId);
      const refreshedPost = getPostData(response);

      if (refreshedPost && typeof refreshedPost === "object") {
        setPost(refreshedPost);
      }
    } catch (err) {
      setPost(previousPost);
      toast.error(err.response?.data?.message || "Failed to update like");
    } finally {
      setLiking(false);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!isOwner || deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deletePost(getId(post));

      toast.success("Post deleted successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  // Start editing post
  const handleEditPost = () => {
    if (!isOwner) return;

    setEditPostContent(getPostText(post));
    setEditPostImage(null);
    setIsEditingPost(true);
  };

  const handleCancelEditPost = () => {
    setIsEditingPost(false);
    setEditPostContent("");
    setEditPostImage(null);
  };

  // Save edited post
  const handleUpdatePost = async (e) => {
    e.preventDefault();

    if (!isOwner || updatingPost) return;

    const body = editPostContent.trim();

    if (!body && !editPostImage && !post?.image) {
      toast.error("Post content or an image is required");
      return;
    }

    try {
      setUpdatingPost(true);

      const formData = new FormData();

      // Route Posts API expects "body" for post text.
      formData.append("body", body);

      if (editPostImage) {
        formData.append("image", editPostImage);
      }

      const response = await updatePost(getId(post), formData);

      const responseData = getPostData(response);

      setPost((previous) => ({
        ...previous,
        ...(responseData && typeof responseData === "object"
          ? responseData
          : {}),
        body,
        ...(editPostImage ? {} : {}),
      }));

      setIsEditingPost(false);
      setEditPostContent("");
      setEditPostImage(null);

      // Refresh the post so the updated image and text are accurate.
      try {
        const refreshedResponse = await getPostById(postId);
        const refreshedPost = getPostData(refreshedResponse);

        if (refreshedPost && typeof refreshedPost === "object") {
          setPost(refreshedPost);
        }
      } catch {
        // Keep the successful update already reflected in state.
      }

      toast.success("Post updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update post");
    } finally {
      setUpdatingPost(false);
    }
  };

  // Create comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const content = commentText.trim();

    if (!content) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setCommenting(true);
      setCommentError("");

      const response = await createComment(postId, content);
      const result = response?.data?.data;
      const newComment = result?.comment ?? result;

      if (newComment && typeof newComment === "object" && getId(newComment)) {
        setComments((previous) => [newComment, ...previous]);
      } else {
        await loadComments();
      }

      setCommentText("");

      setPost((previous) =>
        previous
          ? {
              ...previous,
              commentsCount: (previous.commentsCount ?? comments.length) + 1,
            }
          : previous,
      );

      toast.success("Comment added");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  // Start editing comment
  const handleEditComment = (comment) => {
    setEditingCommentId(getId(comment));
    setEditCommentText(getCommentText(comment));
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // Save edited comment
  const handleUpdateComment = async (e, comment) => {
    e.preventDefault();

    const content = editCommentText.trim();
    const commentId = getId(comment);

    if (!content) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (updatingComment) return;

    try {
      setUpdatingComment(true);

      const response = await updateComment(postId, commentId, content);

      const result = response?.data?.data;
      const updatedComment = result?.comment ?? result;

      setComments((previous) =>
        previous.map((item) =>
          getId(item) === commentId
            ? {
                ...item,
                ...(updatedComment && typeof updatedComment === "object"
                  ? updatedComment
                  : {}),
                content,
              }
            : item,
        ),
      );

      setEditingCommentId(null);
      setEditCommentText("");

      toast.success("Comment updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update comment");
    } finally {
      setUpdatingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (comment) => {
    const commentId = getId(comment);

    const isCommentOwner =
      Boolean(currentUserId) && getCommentOwnerId(comment) === currentUserId;

    if (!isCommentOwner || deletingCommentId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) return;

    try {
      setDeletingCommentId(commentId);

      await deleteComment(postId, commentId);

      setComments((previous) =>
        previous.filter((item) => getId(item) !== commentId),
      );

      setPost((previous) =>
        previous
          ? {
              ...previous,
              commentsCount: Math.max(
                0,
                (previous.commentsCount ?? comments.length) - 1,
              ),
            }
          : previous,
      );

      if (editingCommentId === commentId) {
        handleCancelEditComment();
      }

      toast.success("Comment deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Share post URL
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      toast.success("Post link copied!");
    } catch {
      toast.error("Could not copy the post link");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-500">{error || "Post not found"}</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const postImage = post.image ?? post.photo ?? post.imageUrl ?? null;

  const creator = post.user ?? post.userId ?? post.owner ?? post.createdBy;

  const creatorName =
    typeof creator === "object" ? (creator?.name ?? "User") : "User";

  const creatorImage =
    typeof creator === "object" ? (creator?.photo ?? creator?.image) : null;

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Post card */}
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Post header */}
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={creatorImage || man}
                alt={creatorName}
                className="h-11 w-11 rounded-full border object-cover"
              />

              <div className="min-w-0">
                <h2 className="truncate font-semibold text-gray-900">
                  {creatorName}
                </h2>

                <p className="text-xs text-gray-500">
                  {post.createdAt ? timeAgo(post.createdAt) : ""}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={handleEditPost}
                    disabled={isEditingPost}
                    title="Edit post"
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleDeletePost}
                    disabled={deleting}
                    title="Delete post"
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate(-1)}
                title="Close post"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Post content / edit form */}
          <div className="px-4 pb-4">
            {isEditingPost ? (
              <form onSubmit={handleUpdatePost} className="space-y-4">
                <textarea
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  disabled={updatingPost}
                  placeholder="What's on your mind?"
                  className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                  <ImagePlus size={18} />
                  <span>
                    {editPostImage
                      ? editPostImage.name
                      : "Choose a new image (optional)"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={updatingPost}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setEditPostImage(file);
                      }

                      e.target.value = "";
                    }}
                  />
                </label>

                {editPostImage && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm">
                    <span className="truncate text-gray-600">
                      New image selected
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditPostImage(null)}
                      disabled={updatingPost}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove selection
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={
                      updatingPost ||
                      (!editPostContent.trim() && !editPostImage && !postImage)
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingPost ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEditPost}
                    disabled={updatingPost}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="whitespace-pre-wrap break-words text-gray-800">
                {getPostText(post)}
              </p>
            )}
          </div>

          {/* Post image */}
          {postImage && (
            <div className="border-y border-gray-100">
              <img
                src={postImage}
                alt="Post"
                className="max-h-[600px] w-full object-contain"
              />
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
            <span>
              <ThumbsUp size={15} className="mr-1 inline text-blue-600" />
              {likesCount} likes
            </span>

            <button
              type="button"
              onClick={handleToggleComments}
              className="hover:text-blue-600"
            >
              {commentsCount} comments
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 p-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-50 ${
                liked ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <ThumbsUp size={18} />
              {liked ? "Liked" : "Like"}
            </button>

            <button
              type="button"
              onClick={handleToggleComments}
              className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <MessageCircle size={18} />
              Comment
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <SquareArrowOutUpRight size={17} />
              Share
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <section className="border-t border-gray-200 p-4">
              <h3 className="mb-4 font-semibold text-gray-900">Comments</h3>

              {/* Add comment */}
              <form
                onSubmit={handleCommentSubmit}
                className="mb-4 flex items-start gap-2"
              >
                <img
                  src={currentUser?.photo || man}
                  alt="Your profile"
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="Write a comment..."
                    className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
                  />

                  {commentError && (
                    <p className="mt-1 text-sm text-red-500">{commentError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={commenting || !commentText.trim()}
                    className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {commenting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>

              {/* Comments list */}
              {commentsLoading ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const commentId = getId(comment);
                    const author = getAuthor(comment);
                    const authorName = author?.name ?? "User";
                    const authorImage = author?.photo ?? man;

                    const isCommentOwner =
                      Boolean(currentUserId) &&
                      getCommentOwnerId(comment) === currentUserId;

                    const isEditing = editingCommentId === commentId;

                    return (
                      <div key={commentId} className="flex items-start gap-2">
                        <img
                          src={authorImage}
                          alt={authorName}
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="rounded-xl bg-gray-100 p-3">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {authorName}
                              </span>

                              {isCommentOwner && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditComment(comment)}
                                    title="Edit comment"
                                    className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-blue-600"
                                  >
                                    <Pencil size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment)}
                                    disabled={deletingCommentId === commentId}
                                    title="Delete comment"
                                    className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditing ? (
                              <form
                                onSubmit={(e) =>
                                  handleUpdateComment(e, comment)
                                }
                                className="space-y-2"
                              >
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) =>
                                    setEditCommentText(e.target.value)
                                  }
                                  rows={3}
                                  maxLength={1000}
                                  disabled={updatingComment}
                                  className="w-full resize-y rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="submit"
                                    disabled={
                                      updatingComment || !editCommentText.trim()
                                    }
                                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {updatingComment ? "Saving..." : "Save"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handleCancelEditComment}
                                    disabled={updatingComment}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
                                {getCommentText(comment)}
                              </p>
                            )}
                          </div>

                          <p className="ml-2 mt-1 text-xs text-gray-500">
                            {comment.createdAt
                              ? timeAgo(comment.createdAt)
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
