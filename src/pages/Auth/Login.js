import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaEthereum, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithWallet, loading, error } = useAuth();
  const { account, connectWallet, isConnecting, formatAddress } = useWeb3();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Get the user data from localStorage to determine role
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = userData.role || 'student';
      
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        // Redirect based on user's actual role from database
        navigate(userRole === 'institution' ? '/institution' : '/student');
      }, 1500);
    } else {
      setFormError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleWalletLogin = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    const result = await loginWithWallet();
    
    if (result.success) {
      // Get the user data from localStorage to determine role
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = userData.role || 'student';
      
      setSuccessMessage('Wallet authentication successful! Redirecting...');
      setTimeout(() => {
        navigate(userRole === 'institution' ? '/institution' : '/student');
      }, 1500);
    } else {
      setFormError(result.error || 'Wallet authentication failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to access your dashboard</p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="auth-message success">
                <FiCheckCircle />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {(formError || error) && (
              <div className="auth-message error">
                <FiAlertCircle />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">
                  <FiMail />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FiLock />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* Wallet Login */}
            <button 
              className="btn btn-wallet"
              onClick={handleWalletLogin}
              disabled={isConnecting || loading}
            >
              <FaEthereum />
              {isConnecting ? 'Connecting...' : account ? `Connected: ${formatAddress(account)}` : 'Connect Wallet'}
            </button>

            {/* Register Link */}
            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-visual-icon">
              <FaGraduationCap />
            </div>
            <h2>AccredChain Portal</h2>
            <p>
              Access your blockchain-verified academic credentials securely. 
              Your role will be automatically detected from your account.
            </p>
            <div className="auth-visual-features">
              <div className="visual-feature">
                <FiCheckCircle />
                <span>Secure blockchain verification</span>
              </div>
              <div className="visual-feature">
                <FiCheckCircle />
                <span>Instant credential access</span>
              </div>
              <div className="visual-feature">
                <FiCheckCircle />
                <span>Role-based dashboard</span>
              </div>
            </div>
          </div>
          <div className="auth-visual-bg">
            <div className="visual-gradient"></div>
            <div className="visual-grid"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
