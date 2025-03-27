import './App.css';
import Menu from "./menu/Menu.js";
import Course from "./course/Course.js";
import ReserveClass from "./class/ReserveClass.js";
import Home from "./home/Home.js";
import Service from './service/Service.js';
import Join from './join/Join.js';
import Login from './login/Login.js';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>              
      <Menu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route path="/class" element={<ReserveClass />} />
        <Route path="/join" element={<Join />} />
        <Route path="/login" element={<Login />} />
        <Route path="/service" element={<Service />} />
      </Routes>
    </Router>
  );
}

export default App;
