import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <nav className="App">
      <div>logo</div>
      <ul className="Menu">
        <li>서비스소개</li>
        <li>과정등록</li>
      </ul>
      <div className="LoginInfo">
        <div>회원가입</div>
        <div>로그인</div>
      </div> 
    </nav>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
