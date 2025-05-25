import ClassList from './ClassList';

export default function ClassSection({ title, classes = [], type = 'default', refreshMyClasses }) {
  return (
    <section className="class-section">
      {/* <h4>{title}</h4> */}
      <ClassList
        classes={classes}
        type={type}
        refreshMyClasses={refreshMyClasses}
      />
    </section>
  );
}