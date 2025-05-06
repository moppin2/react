import data from "../../../assets/data/dummy.json";

function Result({ results }) {
  if (!results) return null;
  console.log(results);
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>선택한 항목</h3>
      { data.search.map((item, index) => (
        <p key={index}>{item.title}: {results[item.title].join(', ') || '없음'}</p>
      ))}
    </div>
  );
}

export default Result;