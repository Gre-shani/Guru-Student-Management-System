import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentManagement from './components/StudentManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
