function CourseSearchResult({ results }) {
  if (!results) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>선택한 항목</h3>
      <p>협회: {results['협회'].join(', ') || '없음'}</p>
      <p>레벨: {results['레벨'].join(', ') || '없음'}</p>
      <p>지역: {results['지역'].join(', ') || '없음'}</p>
    </div>
  );
}

export default CourseSearchResult;