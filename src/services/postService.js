import api from "./api";

export const getUserPosts = (userId) => api.get(`/users/${userId}/posts`);

export const getAllPosts = () => api.get("/posts");

export const getPostById = (postId) => api.get(`/posts/${postId}`);

export const createPost = (formData) => api.post("/posts", formData);

export const toggleLike = (postId) => api.put(`/posts/${postId}/like`);

export const getPostComments = (postId) => api.get(`/posts/${postId}/comments`);

export const createComment = (postId, content) =>
  api.post(`/posts/${postId}/comments`, { content });

export const deletePost = (postId) => api.delete(`/posts/${postId}`);

export const updatePost = (postId, formData) =>
  api.put(`/posts/${postId}`, formData);

export const updateComment = (postId, commentId, content) =>
  api.put(`/posts/${postId}/comments/${commentId}`, {
    content,
  });

export const deleteComment = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);
