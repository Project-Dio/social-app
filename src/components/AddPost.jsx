import { useState } from "react";
import { Image, X } from "lucide-react";
import { createPost } from "../services/postService";
import toast from "react-hot-toast";
export default function AddPost() {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!body.trim() && !image) {
      setError("Please write something or select an image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("body", body);

      if (image) {
        formData.append("image", image);
      }

      const response = await createPost(formData);

      console.log("Post created:", response.data);

      // Clear form
      setBody("");
      setImage(null);
      setPreview("");

      toast.success("Post created successfully! 🎉");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create post";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <form onSubmit={handleSubmit}>
        {/* Text */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full min-h-28 resize-none outline-none border-none focus:ring-0 text-gray-700"
        />

        {/* Image preview */}
        {preview && (
          <div className="relative mt-3">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-96 object-cover rounded-lg"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {/* Bottom section */}
        <div className="flex items-center justify-between border-t mt-4 pt-3">
          {/* Image button */}
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-blue-500">
            <Image size={20} />
            <span>Add image</span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Post button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
