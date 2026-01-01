import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import InstitutionDashboard from './pages/Institution/InstitutionDashboard';
import IssueCredential from './pages/Institution/IssueCredential';
import ManageCredentials from './pages/Institution/ManageCredentials';
import StudentDashboard from './pages/Student/StudentDashboard';
import MyCredentials from './pages/Student/MyCredentials';
import ShareCredential from './pages/Student/ShareCredential';
import VerifierPortal from './pages/Verifier/VerifierPortal';
import VerifyCredential from './pages/Verifier/VerifyCredential';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';

// Styles
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          
          {/* Institution Routes */}
          <Route path="/institution" element={<InstitutionDashboard />} />
          <Route path="/institution/issue" element={<IssueCredential />} />
          <Route path="/institution/manage" element={<ManageCredentials />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/credentials" element={<MyCredentials />} />
          <Route path="/student/share/:id" element={<ShareCredential />} />
          
          {/* Verifier Routes */}
          <Route path="/verify" element={<VerifierPortal />} />
          <Route path="/verify/:hash" element={<VerifyCredential />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
