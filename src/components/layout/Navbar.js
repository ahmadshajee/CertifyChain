import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineMenuAlt3, 
  HiX, 
  HiOutlineAcademicCap,
  HiOutlineLink,
  HiOutlineLogin,
  HiOutlineUserAdd,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    formatAddress,
    getNetworkName,
    chainId 
  } = useWeb3();
  
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    disconnectWallet();
    closeMenu();
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      // Before login - minimal links
      return [];
    }

    // Base links for authenticated users
    const baseLinks = [
      { path: '/', label: 'Home', icon: <HiOutlineHome /> },
    ];

    // Role-specific links
    if (user?.role === 'institution') {
      return [
        ...baseLinks,
        { path: '/institution', label: 'Dashboard', icon: <HiOutlineHome /> },
        { path: '/institution/issue', label: 'Issue Credential', icon: <HiOutlinePlusCircle /> },
        { path: '/institution/manage', label: 'Manage', icon: <HiOutlineClipboardList /> },
        { path: '/verify', label: 'Verify', icon: <HiOutlineShieldCheck /> },
      ];
    } else if (user?.role === 'student') {
      return [
        ...baseLinks,
        { path: '/student', label: 'Dashboard', icon: <HiOutlineHome /> },
        { path: '/student/credentials', label: 'My Credentials', icon: <HiOutlineDocumentText /> },
        { path: '/verify', label: 'Verify', icon: <HiOutlineShieldCheck /> },
      ];
    } else {
      // Default or verifier
      return [
        ...baseLinks,
        { path: '/verify', label: 'Verify', icon: <HiOutlineShieldCheck /> },
        { path: '/how-it-works', label: 'How It Works', icon: <HiOutlineQuestionMarkCircle /> },
        { path: '/about', label: 'About', icon: <HiOutlineInformationCircle /> },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-icon">
            <HiOutlineAcademicCap />
          </div>
          <span className="logo-text">
            Accred<span className="logo-highlight">Chain</span>
          </span>
        </Link>

        {/* Desktop Navigation - Only show when authenticated */}
        {isAuthenticated && navLinks.length > 0 && (
          <ul className="navbar-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="user-info">
                <span className="user-role">{user?.role}</span>
                <span className="user-name">{user?.name || user?.email}</span>
              </div>

              {/* Wallet Connection */}
              {isConnected ? (
                <div className="wallet-info">
                  <div className="network-badge">
                    <span className="network-dot"></span>
                    {getNetworkName(chainId)}
                  </div>
                  <button className="wallet-button connected" onClick={disconnectWallet}>
                    <HiOutlineLink />
                    {formatAddress(account)}
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-secondary wallet-connect-btn"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  <HiOutlineLink />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}

              {/* Logout Button */}
              <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                <HiOutlineLogout />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Auth Links - Only show when not authenticated */}
              <Link to="/login" className="btn btn-outline auth-btn">
                <HiOutlineLogin />
                Login
              </Link>
              <Link to="/register" className="btn btn-primary auth-btn">
                <HiOutlineUserAdd />
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated && navLinks.length > 0 && (
            <ul className="mobile-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          
          {isAuthenticated ? (
            <>
              {/* Mobile User Info */}
              <div className="mobile-user-info">
                <span className="user-role-badge">{user?.role}</span>
                <span>{user?.name || user?.email}</span>
              </div>

              {!isConnected && (
                <button 
                  className="btn btn-secondary mobile-wallet-btn"
                  onClick={() => {
                    connectWallet();
                    closeMenu();
                  }}
                  disabled={isConnecting}
                >
                  <HiOutlineLink />
                  Connect Wallet
                </button>
              )}

              <button 
                className="btn btn-outline mobile-logout-btn"
                onClick={handleLogout}
              >
                <HiOutlineLogout />
                Logout
              </button>
            </>
          ) : (
            <div className="mobile-auth-links">
              <Link 
                to="/login" 
                className="btn btn-outline mobile-auth-btn"
                onClick={closeMenu}
              >
                <HiOutlineLogin />
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary mobile-auth-btn"
                onClick={closeMenu}
              >
                <HiOutlineUserAdd />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;