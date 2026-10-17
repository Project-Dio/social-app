import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { getAllPosts } from "../services/postService";
import AddPost from "../components/AddPost";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getAllPosts();
        console.log(response.data); // confirm the shape for this endpoint
        setPosts(response.data.data.posts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="mt-10 text-center">Loading posts...</p>;
  if (error) return <p className="mt-10 text-center text-red-500">{error}</p>;

  return (
    <div className="w-3/5 mx-auto space-y-4 py-6">
      <AddPost />
      {posts.length === 0 ? (
        <p className="text-center">No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </div>
  );
}
