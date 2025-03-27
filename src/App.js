import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Course from "./course/Course.js";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Course />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
