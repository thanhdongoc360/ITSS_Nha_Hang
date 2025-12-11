import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
      >
        <i className="bi bi-house-door-fill"></i>
        <span>ホーム</span>
      </Link>
      
      <Link 
        to="/history" 
        className={`bottom-nav-item ${isActive('/history') ? 'active' : ''}`}
      >
        <i className="bi bi-clock-history"></i>
        <span>履歴</span>
      </Link>
      
      <Link 
        to="/favorites" 
        className={`bottom-nav-item ${isActive('/favorites') ? 'active' : ''}`}
      >
        <i className="bi bi-heart-fill"></i>
        <span>お気に入り</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
      >
        <i className="bi bi-person-fill"></i>
        <span>アカウント</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
