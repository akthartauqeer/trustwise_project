import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './Pages/Home/Home';
import History from './Pages/History/History';
import Login from './Pages/Login/Login';
import Navbar from './Component/Navbar/Navbar';
import ProtectedRoute from './Component/ProtectedRoute';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './App.css';
import Compare from './Pages/Compare/Compare';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); 
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}

      <div className="main-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Home /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute isAuthenticated={isAuthenticated}><History /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Compare /></ProtectedRoute>} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
