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
//관리자관련
import AdminPage from "../pages/admin";
//강사등록 첨부파일 업로드
import InstructorVerify from "../pages/auth/InstructorVerify";

const privateRoutes = [
  //강사권한
  { path: "/course/manage", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><CourseManage /></PrivateRoute> },
  { path: "/course/create", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><CourseCreate /></PrivateRoute> },
  { path: "/course/edit/:id", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><CourseEdit /></PrivateRoute> },
  { path: "/class/manage", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><ClassManage /></PrivateRoute> },
  { path: "/student/manage", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><StudentManage /></PrivateRoute> },
  // { path: "/course/manage", element: <PrivateRoute allowedRoles={['instructor']}><CourseManage /></PrivateRoute> },  // api 테스트용
  // { path: "/course/create", element: <PrivateRoute allowedRoles={['instructor']}><CourseCreate /></PrivateRoute> },  // api 테스트용
  // { path: "/course/edit/:id", element: <PrivateRoute allowedRoles={['instructor']}><CourseEdit /></PrivateRoute> },  // api 테스트용
  // { path: "/class/manage", element: <PrivateRoute allowedRoles={['instructor']}><ClassManage /></PrivateRoute> },  // api 테스트용
  // { path: "/student/manage", element: <PrivateRoute allowedRoles={['instructor']}><StudentManage /></PrivateRoute> },  // api 테스트용
  { path: "/instructor/verify/:id?", element: <PrivateRoute allowedRoles={['instructor','admin']}><InstructorVerify /></PrivateRoute> },  // 강사인증 첨부파일메뉴

  //수강생권한
  { path: "/class/reserve", element: <PrivateRoute allowedRoles={['user']}><ClassReserve /></PrivateRoute> },

  //관리자권한
  { path: "/admin", element: <PrivateRoute allowedRoles={['admin']}><AdminPage /></PrivateRoute> },
];

export default privateRoutes;