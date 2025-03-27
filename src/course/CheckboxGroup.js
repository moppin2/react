

function CheckboxGroup({ title, options, onChange }) {
    const handleCheckboxChange = (e) => {
      const { value, checked } = e.target;
      onChange(title, value, checked);
    };
  
    return (
      <section>
        <p>{title}</p>
        <div className="checkbox-group">
          {options.map((label, idx) => (
            <label key={idx}>
              <input
                type="checkbox"
                value={label}
                onChange={handleCheckboxChange}
              />
              {label}
            </label>
          ))}
        </div>
      </section>
    );
  }
  
  export default CheckboxGroup;