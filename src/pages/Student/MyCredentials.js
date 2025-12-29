import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { 
  HiOutlineHome,
  HiOutlineCollection,
  HiOutlineShare,
  HiOutlineDocumentDownload,
  HiOutlineQrcode,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineBadgeCheck,
  HiOutlineClock,
  HiOutlineExternalLink
} from 'react-icons/hi';
import './Student.css';

const MyCredentials = () => {
  const location = useLocation();
  const { isConnected, account, formatAddress } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const sidebarLinks = [
    { path: '/student', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/student/credentials', icon: <HiOutlineCollection />, label: 'My Credentials' },
  ];

  const credentials = [
    { 
      id: 1, 
      type: 'Bachelor of Technology', 
      course: 'Computer Science & Engineering',
      institution: 'IIT Delhi',
      date: '2024-06-15',
      status: 'verified',
      hash: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
      grade: '8.5 CGPA',
      views: 45
    },
    { 
      id: 2, 
      type: 'Machine Learning Certificate', 
      course: 'Advanced ML Course',
      institution: 'Coursera - Stanford',
      date: '2024-03-20',
      status: 'verified',
      hash: '0x9c4b8a7d6e5f4c3b2a1d0e9f8c7b6a5d4e3f2c1b',
      grade: 'Distinction',
      views: 32
    },
    { 
      id: 3, 
      type: 'Internship Certificate', 
      course: 'Software Engineering Intern',
      institution: 'Google India',
      date: '2023-12-01',
      status: 'verified',
      hash: '0x3e5d8f2a4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e',
      grade: 'Excellent',
      views: 89
    },
    { 
      id: 4, 
      type: 'AWS Cloud Practitioner', 
      course: 'Cloud Certification',
      institution: 'Amazon Web Services',
      date: '2024-01-10',
      status: 'pending',
      hash: '0x6f2a4c9d8e7b5a3f1c2d4e6f8a0b2c4d6e8f0a2c',
      grade: 'Pass',
      views: 12
    },
    { 
      id: 5, 
      type: 'Web Development Bootcamp', 
      course: 'Full Stack Development',
      institution: 'Udemy',
      date: '2023-09-15',
      status: 'verified',
      hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      grade: 'Completed',
      views: 23
    },
    { 
      id: 6, 
      type: 'Data Science Specialization', 
      course: 'Applied Data Science',
      institution: 'IBM - Coursera',
      date: '2023-07-20',
      status: 'verified',
      hash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
      grade: 'With Honors',
      views: 56
    },
  ];

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cred.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isConnected) {
    return (
      <div className="connect-prompt">
        <div className="connect-card">
          <div className="connect-icon">🎓</div>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to access your credentials</p>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="student-profile">
            <div className="profile-avatar">🎓</div>
            <div>
              <h3>Student Portal</h3>
              <p className="wallet-address">{formatAddress(account)}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>My Credentials</h1>
            <p>View and manage all your blockchain-verified credentials</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <HiOutlineFilter />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className={`credentials-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {filteredCredentials.map((cred) => (
            <div key={cred.id} className={`credential-card-student ${viewMode === 'list' ? 'list-card' : ''}`}>
              <div className="credential-card-header">
                <div className={`status-indicator ${cred.status}`}>
                  {cred.status === 'verified' ? (
                    <><HiOutlineBadgeCheck /> Verified</>
                  ) : (
                    <><HiOutlineClock /> Pending</>
                  )}
                </div>
                <span className="view-count">{cred.views} views</span>
              </div>
              
              <h3>{cred.type}</h3>
              <p className="credential-course">{cred.course}</p>
              
              <div className="credential-meta">
                <span className="institution">{cred.institution}</span>
                <span className="date">{cred.date}</span>
              </div>

              <div className="credential-details-row">
                <div className="detail-item">
                  <span className="label">Grade</span>
                  <span className="value">{cred.grade}</span>
                </div>
              </div>

              <div className="credential-hash-display">
                <code>{cred.hash.slice(0, 20)}...{cred.hash.slice(-8)}</code>
                <button className="copy-btn" title="Copy hash">
                  <HiOutlineExternalLink />
                </button>
              </div>

              <div className="credential-actions">
                <Link to={`/student/share/${cred.id}`} className="btn btn-primary btn-sm">
                  <HiOutlineShare /> Share
                </Link>
                <button className="btn btn-secondary btn-sm">
                  <HiOutlineQrcode />
                </button>
                <button className="btn btn-secondary btn-sm">
                  <HiOutlineDocumentDownload />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCredentials.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <h3>No credentials found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCredentials;
