import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/home";
import AuthLayout from "./layouts/AuthLayout";
import Auth from "./pages/Auth";
import PostDetails from "./pages/PostDetails";
import ChangePassword from "./pages/ChangePassword";
import MyProfile from "./pages/MyProfile";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/:postId" element={<PostDetails />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/profile" element={<MyProfile />} />
          </Route>
        </Route>

        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Auth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
