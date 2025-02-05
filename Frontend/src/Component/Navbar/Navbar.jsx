import { Link, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // Firebase authentication
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  // Handle logout
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('User logged out');
        // Redirect to login page if needed
      })
      .catch((error) => {
        console.error('Logout error:', error.message);
      });
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">Trustwise Project</div>
      <div className="navbar-center">
        <div className="navbar-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link  to="/compare" 
            className={location.pathname === '/compare' ? 'active' : ''}
          >
            Compare
          </Link>
          <Link 
            to="/history" 
            className={location.pathname === '/history' ? 'active' : ''}
          >
            History
          </Link>
        
          
        </div>
      </div>
      <div className="navbar-right">
        <span className="logout-text" onClick={handleLogout}>
          Logout
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
