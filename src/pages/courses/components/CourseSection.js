import CourseList from './CourseList';

export default function CourseSection({ title, courses = [], loading, type = 'default' }) {
  return (
    <section className="course-section">
      {/* <h4>{title}</h4> */}
      <CourseList courses={courses} loading={loading} type={type} />
    </section>
  );
}