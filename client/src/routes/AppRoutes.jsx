import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

import Home from "../pages/Home/Home";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

import JobListing from "../pages/Jobs/JobListing";
import JobDetails from "../pages/Jobs/JobDetails";
import ApplyJob from "../pages/Jobs/ApplyJob";

import Apprenticeships from "../pages/Apprenticeships/Apprenticeships";

import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentProfile from "../pages/Student/StudentProfile";
import MyApplications from "../pages/Student/MyApplications";
import SavedJobs from "../pages/Student/SavedJobs";

import EmployerDashboard from "../pages/Employer/EmployerDashboard";
import EmployerProfile from "../pages/Employer/EmployerProfile";
import PostJob from "../pages/Employer/PostJob";
import ManageJobs from "../pages/Employer/ManageJobs";
import Applications from "../pages/Employer/Applications";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import ManageEmployers from "../pages/Admin/ManageEmployers";
import ManageJobsAdmin from "../pages/Admin/ManageJobs";
import Analytics from "../pages/Admin/Analytics";

const roleHome = {
  student: "/student/dashboard",
  employer: "/employer/dashboard",
  admin: "/admin/dashboard",
};

function RoleRoute({ role, children }) {
  const location = useLocation();
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const currentRole = user?.role || localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (currentRole !== role) {
    return <Navigate to={roleHome[currentRole] || "/"} replace />;
  }

  return children;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const navbarIsAlreadyOnPage =
    pathname === "/" || pathname === "/apprenticeships";
  const authPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);

  return (
    <>
      {!navbarIsAlreadyOnPage && !authPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/jobs" element={<JobListing />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs/:id/apply" element={<ApplyJob />} />

        <Route path="/apprenticeships" element={<Apprenticeships />} />

        <Route
          path="/student/dashboard"
          element={
            <RoleRoute role="student">
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <RoleRoute role="student">
              <StudentProfile />
            </RoleRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <RoleRoute role="student">
              <MyApplications />
            </RoleRoute>
          }
        />
        <Route
          path="/student/saved-jobs"
          element={
            <RoleRoute role="student">
              <SavedJobs />
            </RoleRoute>
          }
        />

        <Route
          path="/employer/dashboard"
          element={
            <RoleRoute role="employer">
              <EmployerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/employer/profile"
          element={
            <RoleRoute role="employer">
              <EmployerProfile />
            </RoleRoute>
          }
        />
        <Route
          path="/employer/post-job"
          element={
            <RoleRoute role="employer">
              <PostJob />
            </RoleRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <RoleRoute role="employer">
              <ManageJobs />
            </RoleRoute>
          }
        />
        <Route
          path="/employer/applications"
          element={
            <RoleRoute role="employer">
              <Applications />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute role="admin">
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute role="admin">
              <ManageUsers />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/employers"
          element={
            <RoleRoute role="admin">
              <ManageEmployers />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <RoleRoute role="admin">
              <ManageJobsAdmin />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RoleRoute role="admin">
              <Analytics />
            </RoleRoute>
          }
        />
      </Routes>
    </>
  );
}

export default AppRoutes;
