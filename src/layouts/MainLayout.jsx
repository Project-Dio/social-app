import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="w-3/5 mx-auto mt-4">
        <Outlet />
      </main>
    </>
  );
}
