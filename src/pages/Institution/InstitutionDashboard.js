import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { 
  HiOutlineDocumentAdd,
  HiOutlineCollection,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineBadgeCheck
} from 'react-icons/hi';
import './Institution.css';

const InstitutionDashboard = () => {
  const location = useLocation();
  const { isConnected, account, formatAddress } = useWeb3();

  const sidebarLinks = [
    { path: '/institution', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/institution/issue', icon: <HiOutlineDocumentAdd />, label: 'Issue Credential' },
    { path: '/institution/manage', icon: <HiOutlineCollection />, label: 'Manage Credentials' },
  ];

  const stats = [
    { icon: <HiOutlineClipboardList />, value: '156', label: 'Total Issued', color: 'blue' },
    { icon: <HiOutlineBadgeCheck />, value: '142', label: 'Active Credentials', color: 'green' },
    { icon: <HiOutlineUserGroup />, value: '98', label: 'Students', color: 'purple' },
    { icon: <HiOutlineChartBar />, value: '1,234', label: 'Verifications', color: 'orange' },
  ];

  const recentCredentials = [
    { id: 1, student: 'John Doe', type: 'B.Tech Certificate', date: '2024-01-15', status: 'active' },
    { id: 2, student: 'Jane Smith', type: 'M.Tech Certificate', date: '2024-01-14', status: 'active' },
    { id: 3, student: 'Mike Johnson', type: 'Transcript', date: '2024-01-13', status: 'active' },
    { id: 4, student: 'Sarah Wilson', type: 'B.Tech Certificate', date: '2024-01-12', status: 'revoked' },
    { id: 5, student: 'Tom Brown', type: 'Course Completion', date: '2024-01-11', status: 'active' },
  ];

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
              className={`sidebar-nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/institution/issue" className="btn btn-primary sidebar-cta">
            <HiOutlinePlusCircle />
            Issue New Credential
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Welcome Back! 👋</h1>
            <p>Manage and issue academic credentials on the blockchain</p>
          </div>
          <Link to="/institution/issue" className="btn btn-primary">
            <HiOutlinePlusCircle />
            Issue Credential
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Credentials */}
        <div className="table-container">
          <div className="table-header">
            <h2>Recent Credentials</h2>
            <Link to="/institution/manage" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Credential Type</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCredentials.map((cred) => (
                <tr key={cred.id}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {cred.student.charAt(0)}
                      </div>
                      {cred.student}
                    </div>
                  </td>
                  <td>{cred.type}</td>
                  <td>{cred.date}</td>
                  <td>
                    <span className={`badge badge-${cred.status === 'active' ? 'success' : 'danger'}`}>
                      {cred.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/institution/issue" className="action-card">
              <div className="action-icon blue">
                <HiOutlineDocumentAdd />
              </div>
              <h3>Issue Single Credential</h3>
              <p>Issue a credential to one student</p>
            </Link>
            <Link to="/institution/issue?batch=true" className="action-card">
              <div className="action-icon green">
                <HiOutlineCollection />
              </div>
              <h3>Batch Issue</h3>
              <p>Issue multiple credentials via CSV</p>
            </Link>
            <Link to="/institution/manage" className="action-card">
              <div className="action-icon purple">
                <HiOutlineChartBar />
              </div>
              <h3>View Analytics</h3>
              <p>Check credential statistics</p>
            </Link>
            <Link to="/institution/settings" className="action-card">
              <div className="action-icon orange">
                <HiOutlineCog />
              </div>
              <h3>Settings</h3>
              <p>Configure institution profile</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstitutionDashboard;
