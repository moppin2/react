import PrivateRoute from "../components/PrivateRoute";
//코스관련
import CourseManage from "../pages/courses/manage";
import CourseCreate from "../pages/courses/create";
import CourseEdit from "../pages/courses/edit";
import EnrollmentApprovePage from "../pages/courses/enrollmentApprove";
//수업관련
import ClassManage from "../pages/classes/manage";
import ClassCreate from "../pages/classes/create";
import FeedbackCreate from "../pages/classes/feedback/create";
import FeedbackEdit from "../pages/classes/feedback/edit";
import WriteReview from "../pages/classes/review/write";
//학생관련
import StudentManage from "../pages/students/manage";
//관리자관련
import AdminPage from "../pages/admin";
//강사등록 첨부파일 업로드
import InstructorVerify from "../pages/auth/InstructorVerify";
//채팅팅
import ChatRoomPage from "../pages/chat/ChatRoom";

const privateRoutes = [
  //강사권한
  { path: "/course/manage", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><CourseManage /></PrivateRoute> },
  { path: "/course/create", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><CourseCreate /></PrivateRoute> },
  { path: "/course/edit/:id", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><CourseEdit /></PrivateRoute> },
  { path: "/course/enrollment/approve/:courseId?", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><EnrollmentApprovePage /></PrivateRoute> },
  { path: "/class/manage", element: <PrivateRoute allowedRoles={['instructor', 'user']} allowedStatus={['approved']}><ClassManage /></PrivateRoute> },
  { path: "/class/create", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><ClassCreate /></PrivateRoute> },
  { path: "/class/:classId/feedback/:studentId", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><FeedbackCreate /></PrivateRoute> },
  { path: "/feedback/edit/:feedbackId", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><FeedbackEdit /></PrivateRoute> },
  { path: "/review/write/:classId", element: <PrivateRoute allowedRoles={['user']}><WriteReview /></PrivateRoute> },
  { path: "/student/manage", element: <PrivateRoute allowedRoles={['instructor']} allowedStatus={['approved']}><StudentManage /></PrivateRoute> },
  { path: "/instructor/verify/:id?", element: <PrivateRoute allowedRoles={['instructor','admin']}><InstructorVerify /></PrivateRoute> },  // 강사인증 첨부파일메뉴
  { path: "/chat/room/:roomId", element: <PrivateRoute allowedRoles={['user','instructor']} allowedStatus={['approved']}><ChatRoomPage /></PrivateRoute> },


  //관리자권한
  { path: "/admin", element: <PrivateRoute allowedRoles={['admin']}><AdminPage /></PrivateRoute> },
];

export default privateRoutes;