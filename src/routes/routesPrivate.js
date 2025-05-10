import PrivateRoute from "../components/PrivateRoute";
//코스관련
import CourseManage from "../pages/courses/manage";
import CourseCreate from "../pages/courses/create";
import CourseEdit from "../pages/courses/edit";
//수업관련
import ClassReserve from "../pages/classes/reserve";
import ClassManage from "../pages/classes/manage";
//학생관련
import StudentManage from "../pages/students/manage";
//강사등록 첨부파일 업로드
import InstructorVerify from "../pages/auth/InstructorVerify";

const privateRoutes = [
  //강사권한
  { path: "/course/manage", element: <PrivateRoute allowedRoles={['instructor']}><CourseManage /></PrivateRoute> },
  { path: "/course/create", element: <PrivateRoute allowedRoles={['instructor']}><CourseCreate /></PrivateRoute> },
  { path: "/course/edit", element: <PrivateRoute allowedRoles={['instructor']}><CourseEdit /></PrivateRoute> },
  { path: "/class/manage", element: <PrivateRoute allowedRoles={['instructor']}><ClassManage /></PrivateRoute> },
  { path: "/student/manage", element: <PrivateRoute allowedRoles={['instructor']}><StudentManage /></PrivateRoute> },
  { path: "/instructor/verify", element: <PrivateRoute allowedRoles={['instructor']}><InstructorVerify /></PrivateRoute> },  // 강사인증 첨부파일메뉴

  //수강생권한
  { path: "/class/reserve", element: <PrivateRoute allowedRoles={['user']}><ClassReserve /></PrivateRoute> },
];

export default privateRoutes;