import CourseList from './CourseList';

export default function CourseSection({ title, courses = [], type = 'default' }) {
  return (
    <section className="course-section">
      <h2>{title}</h2>
      <CourseList courses={courses} type={type} />
    </section>
  );
}