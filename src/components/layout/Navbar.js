import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { 
  HiOutlineMenuAlt3, 
  HiX, 
  HiOutlineAcademicCap,
  HiOutlineLink
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/institution', label: 'Institution' },
    { path: '/student', label: 'Student' },
    { path: '/verify', label: 'Verify' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-icon">
            <HiOutlineAcademicCap />
          </div>
          <span className="logo-text">
            Certify<span className="logo-highlight">Chain</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Wallet Connection */}
        <div className="navbar-actions">
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
              className="btn btn-primary wallet-connect-btn"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="loading-spinner-sm"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <HiOutlineLink />
                  Connect Wallet
                </>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {!isConnected && (
            <button 
              className="btn btn-primary mobile-wallet-btn"
              onClick={() => {
                connectWallet();
                closeMenu();
              }}
              disabled={isConnecting}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
