// router/Router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../layout/Main";
import Login from "../components/Login";
import ChangePassword from "../components/Auth/ChangePassword";
import ForgotPassword from "../components/Auth/ForgotPassword";
import MyClaims from "../pages/MyClaims";
import MyProfile from "../pages/MyProfile";
import Submission from "../pages/SubmitClaim";
import Claims from "../pages/Claims";
import UserDashboard from "../pages/userdashboard";
import ApproverDashboard from "../pages/approverdashboard";

// New: A smart landing page that redirects based on role
import RoleBasedRedirect from "../components/RoleBasedRedirect";
import AdminrDashboard from "../pages/admindashboard";

const router = createBrowserRouter([
  // Public Routes
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // Protected Layout
  {
    path: "/",
    element: <Main />,
    children: [
      // This will be our smart redirect after login
      { index: true, element: <RoleBasedRedirect /> },
      { path: "home", element: <RoleBasedRedirect /> }, // optional alias

      { path: "userdashboard", element: <UserDashboard /> },
      { path: "approverdashboard", element: <ApproverDashboard /> },
      { path: "admindashboard", element: <AdminrDashboard /> },
      { path: "myclaims", element: <MyClaims /> },
      { path: "myprofile", element: <MyProfile /> },
      { path: "submitaclaim", element: <Submission /> },
      { path: "claims", element: <Claims /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },

  // Optional: Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;