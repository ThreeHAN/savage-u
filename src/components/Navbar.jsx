import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo-link">
          <div className="navbar-logo">
            <img src="./savage-u-logo.png" alt="Savage U Logo" className="logo-icon" />
            <span className="logo-text">SAVAGEU</span>
          </div>
        </Link>
        <button 
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li>
            <a href="/#select-teams" onClick={() => setIsOpen(false)}>
              Select Teams
            </a>
          </li>
          <li>
            <Link to="/baseball/14U" onClick={() => setIsOpen(false)}>
              14U
            </Link>
          </li>
          <li>
            <a href="#private-lessons" onClick={() => setIsOpen(false)}>
              Lessons
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
