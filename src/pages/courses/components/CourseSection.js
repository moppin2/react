import CourseList from './CourseList';

export default function CourseSection({ title, courses = [], type = 'default' }) {
  return (
    <section className="course-section">
      {/* <h4>{title}</h4> */}
      <CourseList courses={courses} type={type} />
    </section>
  );
}