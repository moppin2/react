import Home from "../pages/home/Home";
import CourseSearch from "../pages/courses/search";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import CourseDetail from "../pages/courses/detail";

const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/course/search", element: <CourseSearch /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/course/:id", element: <CourseDetail /> },  
];

export default publicRoutes;