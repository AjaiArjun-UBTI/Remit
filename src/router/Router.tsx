// router/Router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../layout/Main";
import Login from "../components/Login";
import Home from "../pages/Home";
import ChangePassword from "../components/Auth/ChangePassword";
import ForgotPassword from "../components/Auth/ForgotPassword";
import MyClaims from "../pages/MyClaims";
import MyProfile from "../pages/MyProfile";
import Submission from "../pages/SubmitClaim";
import Claims from "../pages/Claims";

const router = createBrowserRouter([
  // ── Public Routes (No Layout) ─────────────────────
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // ── Protected Routes (Inside Main Layout) ────────
  {
    path: "/",
    element: <Main />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "myclaims", element: <MyClaims /> },         // <- changed
      { path: "myprofile", element: <MyProfile /> },       // <- changed
      { path: "submission", element: <Submission /> },
      { path: "claims", element: <Claims /> },
      { path: "change-password", element: <ChangePassword /> },
      // Add more pages here
    ],
  },

  // ── 404 ───────────────────────────────────────────
  { path: "*", element: <Navigate to="/home" replace /> },
]);

export default router;