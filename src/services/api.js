import axios from "axios";
import { getToken } from "../utils/tokenStorage";

const api = axios.create({
  baseURL: "https://route-posts.routemisr.com",
});

// Automatically attach the token to every request (once you have one)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;
