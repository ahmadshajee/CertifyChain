import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { 
  HiOutlineDocumentAdd,
  HiOutlineCollection,
  HiOutlineHome,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDotsVertical,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineDownload
} from 'react-icons/hi';
import './Institution.css';

const ManageCredentials = () => {
  const { isConnected, account, formatAddress } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const sidebarLinks = [
    { path: '/institution', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/institution/issue', icon: <HiOutlineDocumentAdd />, label: 'Issue Credential' },
    { path: '/institution/manage', icon: <HiOutlineCollection />, label: 'Manage Credentials' },
  ];

  const credentials = [
    { id: 1, hash: '0x7f8a...3d2e', student: 'John Doe', wallet: '0x1234...5678', type: 'B.Tech Certificate', course: 'Computer Science', date: '2024-01-15', status: 'active', verifications: 45 },
    { id: 2, hash: '0x9c4b...7a1f', student: 'Jane Smith', wallet: '0x2345...6789', type: 'M.Tech Certificate', course: 'Data Science', date: '2024-01-14', status: 'active', verifications: 32 },
    { id: 3, hash: '0x3e5d...8b2c', student: 'Mike Johnson', wallet: '0x3456...7890', type: 'Transcript', course: 'Electronics', date: '2024-01-13', status: 'active', verifications: 18 },
    { id: 4, hash: '0x6f2a...4c9d', student: 'Sarah Wilson', wallet: '0x4567...8901', type: 'B.Tech Certificate', course: 'Mechanical', date: '2024-01-12', status: 'revoked', verifications: 67 },
    { id: 5, hash: '0x1d8e...5f3a', student: 'Tom Brown', wallet: '0x5678...9012', type: 'Course Completion', course: 'Machine Learning', date: '2024-01-11', status: 'active', verifications: 23 },
    { id: 6, hash: '0x4c7f...2e8b', student: 'Emily Davis', wallet: '0x6789...0123', type: 'PhD Certificate', course: 'Physics', date: '2024-01-10', status: 'active', verifications: 89 },
    { id: 7, hash: '0x8a3d...6c1e', student: 'Chris Lee', wallet: '0x7890...1234', type: 'Diploma', course: 'Web Development', date: '2024-01-09', status: 'expired', verifications: 12 },
    { id: 8, hash: '0x2b9e...7d4f', student: 'Anna Martinez', wallet: '0x8901...2345', type: 'Certificate', course: 'Cloud Computing', date: '2024-01-08', status: 'active', verifications: 56 },
  ];

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cred.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isConnected) {
    return (
      <div className="connect-prompt">
        <div className="connect-card">
          <div className="connect-icon">🔐</div>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to access the Institution Dashboard</p>
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
          <div className="institution-info">
            <div className="institution-avatar">🏛️</div>
            <div>
              <h3>Institution Portal</h3>
              <p className="wallet-address">{formatAddress(account)}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-nav-item ${window.location.pathname === link.path ? 'active' : ''}`}
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
            <h1>Manage Credentials</h1>
            <p>View and manage all issued credentials</p>
          </div>
          <Link to="/institution/issue" className="btn btn-primary">
            <HiOutlineDocumentAdd />
            Issue New
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, hash, or type..."
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
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button className="btn btn-secondary">
            <HiOutlineDownload />
            Export CSV
          </button>
        </div>

        {/* Credentials Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Credential Hash</th>
                <th>Student</th>
                <th>Type</th>
                <th>Course</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Verifications</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCredentials.map((cred) => (
                <tr key={cred.id}>
                  <td>
                    <code className="hash-code">{cred.hash}</code>
                  </td>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {cred.student.charAt(0)}
                      </div>
                      <div>
                        <div>{cred.student}</div>
                        <small className="wallet-small">{cred.wallet}</small>
                      </div>
                    </div>
                  </td>
                  <td>{cred.type}</td>
                  <td>{cred.course}</td>
                  <td>{cred.date}</td>
                  <td>
                    <span className={`badge badge-${cred.status === 'active' ? 'success' : cred.status === 'revoked' ? 'danger' : 'warning'}`}>
                      {cred.status}
                    </span>
                  </td>
                  <td>
                    <span className="verification-count">{cred.verifications}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn" title="View">
                        <HiOutlineEye />
                      </button>
                      <button className="action-btn danger" title="Revoke">
                        <HiOutlineTrash />
                      </button>
                      <button className="action-btn" title="More">
                        <HiOutlineDotsVertical />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCredentials.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No credentials found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">Showing 1-8 of 156 credentials</span>
          <div className="pagination-buttons">
            <button className="pagination-btn" disabled>Previous</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span>...</span>
            <button className="pagination-btn">20</button>
            <button className="pagination-btn">Next</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageCredentials;
