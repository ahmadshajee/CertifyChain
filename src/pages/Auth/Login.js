import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaEthereum, FaGraduationCap, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithWallet, loading, error } = useAuth();
  const { account, connectWallet, isConnecting, formatAddress } = useWeb3();
  
  // Get role from URL params (student or institution)
  const searchParams = new URLSearchParams(location.search);
  const roleFromUrl = searchParams.get('role') || 'student';
  
  const [role, setRole] = useState(roleFromUrl);
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
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate(role === 'institution' ? '/institution' : '/student');
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
      setSuccessMessage('Wallet authentication successful! Redirecting...');
      setTimeout(() => {
        navigate(role === 'institution' ? '/institution' : '/student');
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
              <p>Sign in to access your {role === 'institution' ? 'institution' : 'student'} dashboard</p>
            </div>

            {/* Role Selector */}
            <div className="role-selector">
              <button
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <FaGraduationCap />
                <span>Student</span>
              </button>
              <button
                className={`role-btn ${role === 'institution' ? 'active' : ''}`}
                onClick={() => setRole('institution')}
              >
                <FaUniversity />
                <span>Institution</span>
              </button>
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
              <Link to={`/register?role=${role}`}>Create one</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-visual-icon">
              {role === 'institution' ? <FaUniversity /> : <FaGraduationCap />}
            </div>
            <h2>
              {role === 'institution' 
                ? 'Institution Portal' 
                : 'Student Portal'}
            </h2>
            <p>
              {role === 'institution'
                ? 'Issue and manage blockchain-verified credentials for your students. Join the future of academic verification.'
                : 'Access and share your blockchain-verified academic credentials securely. Your achievements, verified forever.'}
            </p>
            <div className="auth-visual-features">
              {role === 'institution' ? (
                <>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Issue tamper-proof credentials</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Manage student records</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Track verification requests</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>View all your credentials</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Share securely with employers</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Instant verification via QR</span>
                  </div>
                </>
              )}
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
