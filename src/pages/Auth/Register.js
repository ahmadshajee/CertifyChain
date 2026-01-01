import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiPhone, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaEthereum, FaGraduationCap, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading, error } = useAuth();
  const { account, connectWallet, isConnecting, formatAddress } = useWeb3();
  
  // Get role from URL params (student or institution)
  const searchParams = new URLSearchParams(location.search);
  const roleFromUrl = searchParams.get('role') || 'student';
  
  const [role, setRole] = useState(roleFromUrl);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    // Student fields
    firstName: '',
    lastName: '',
    studentId: '',
    // Institution fields
    institutionName: '',
    institutionType: 'university',
    address: '',
    contactPerson: '',
    phone: '',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (role === 'student') {
      if (!formData.firstName || !formData.lastName) {
        setFormError('Please fill in your name');
        return false;
      }
    } else {
      if (!formData.institutionName || !formData.contactPerson) {
        setFormError('Please fill in institution details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setFormError('');
    }
  };

  const handleBack = () => {
    setStep(1);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateStep2()) return;

    const userData = {
      email: formData.email,
      password: formData.password,
      role: role,
      walletAddress: account || formData.walletAddress,
      ...(role === 'student' 
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            studentId: formData.studentId,
          }
        : {
            institutionName: formData.institutionName,
            institutionType: formData.institutionType,
            address: formData.address,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
          }
      ),
    };

    const result = await register(userData);
    
    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login?role=${role}`);
      }, 2000);
    } else {
      setFormError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Join AccredChain as a {role === 'institution' ? 'credential issuer' : 'student'}</p>
            </div>

            {/* Role Selector */}
            <div className="role-selector">
              <button
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => { setRole('student'); setStep(1); }}
              >
                <FaGraduationCap />
                <span>Student</span>
              </button>
              <button
                className={`role-btn ${role === 'institution' ? 'active' : ''}`}
                onClick={() => { setRole('institution'); setStep(1); }}
              >
                <FaUniversity />
                <span>Institution</span>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="auth-steps">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Account</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">Details</span>
              </div>
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {step === 1 && (
                <>
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
                        placeholder="Create a strong password"
                        autoComplete="new-password"
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

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <FiLock />
                      Confirm Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {/* Wallet Connection */}
                  <div className="form-group">
                    <label>
                      <FaEthereum />
                      Wallet Address (Optional)
                    </label>
                    <button 
                      type="button"
                      className="btn btn-wallet-connect"
                      onClick={handleConnectWallet}
                      disabled={isConnecting}
                    >
                      <FaEthereum />
                      {isConnecting ? 'Connecting...' : account ? `Connected: ${formatAddress(account)}` : 'Connect MetaMask'}
                    </button>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-primary auth-submit-btn"
                    onClick={handleNext}
                  >
                    Continue
                  </button>
                </>
              )}

              {step === 2 && role === 'student' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        <FiUser />
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">
                        <FiUser />
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="studentId">
                      <FaGraduationCap />
                      Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}

              {step === 2 && role === 'institution' && (
                <>
                  <div className="form-group">
                    <label htmlFor="institutionName">
                      <FaUniversity />
                      Institution Name
                    </label>
                    <input
                      type="text"
                      id="institutionName"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleChange}
                      placeholder="Enter institution name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="institutionType">
                      <FaUniversity />
                      Institution Type
                    </label>
                    <select
                      id="institutionType"
                      name="institutionType"
                      value={formData.institutionType}
                      onChange={handleChange}
                    >
                      <option value="university">University</option>
                      <option value="college">College</option>
                      <option value="school">School</option>
                      <option value="training">Training Institute</option>
                      <option value="certification">Certification Body</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactPerson">
                      <FiUser />
                      Contact Person
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Authorized representative"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">
                        <FiPhone />
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Contact number"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">
                        <FiMapPin />
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Institution address"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Register Institution'}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Login Link */}
            <p className="auth-switch">
              Already have an account?{' '}
              <Link to={`/login?role=${role}`}>Sign in</Link>
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
                ? 'Join as Institution' 
                : 'Join as Student'}
            </h2>
            <p>
              {role === 'institution'
                ? 'Become a verified credential issuer on the blockchain. Issue tamper-proof academic credentials that employers can trust.'
                : 'Get your academic credentials verified on the blockchain. Share them instantly with employers and institutions worldwide.'}
            </p>
            <div className="auth-visual-features">
              {role === 'institution' ? (
                <>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Blockchain-verified credentials</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Reduce fraud and forgery</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Easy integration</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Own your credentials</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Instant verification</span>
                  </div>
                  <div className="visual-feature">
                    <FiCheckCircle />
                    <span>Share with QR codes</span>
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

export default Register;
