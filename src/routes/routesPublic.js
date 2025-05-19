import Home from "../pages/home/Home";
import CourseSearchPage from "../pages/courses/search";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import CourseDetail from "../pages/courses/detail";
import AdminLogin from "../pages/auth/AdminLogin";
import UserProfile from "../pages/auth/profile/User.js";
import InstructorProfile from "../pages/auth/profile/Instructor.js";

const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/course/search", element: <CourseSearchPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/course/:id", element: <CourseDetail /> },  
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/profile/user/:id", element: <UserProfile /> },
  { path: "/profile/instructor/:id", element: <InstructorProfile /> },
];

export default publicRoutes;