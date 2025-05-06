import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

import Menu from "./layouts/Menu";
import routes from './routes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Menu />
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
