import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { toast } from 'react-toastify';
import { 
  HiOutlineDocumentAdd,
  HiOutlineCollection,
  HiOutlineHome,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDotsVertical,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineRefresh
} from 'react-icons/hi';
import './Institution.css';

const ManageCredentials = () => {
  // Test mode - bypass MetaMask requirement
  const testMode = true;
  
  const { isConnected, account, formatAddress } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institutionInfo, setInstitutionInfo] = useState(null);

  const sidebarLinks = [
    { path: '/institution', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/institution/issue', icon: <HiOutlineDocumentAdd />, label: 'Issue Credential' },
    { path: '/institution/manage', icon: <HiOutlineCollection />, label: 'Manage Credentials' },
  ];

  // Load institution info from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setInstitutionInfo(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  }, []);

  // Fetch credentials from JSON API
  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`http://localhost:5000/api/credentials-json/institution/${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      } else {
        console.error('Failed to fetch credentials');
        setCredentials([]);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // Revoke a credential
  const handleRevoke = async (tokenId) => {
    if (!window.confirm('Are you sure you want to revoke this credential? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/credentials-json/${tokenId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: 'Revoked by institution' })
      });
      
      if (response.ok) {
        toast.success('Credential revoked successfully');
        fetchCredentials();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to revoke credential');
      }
    } catch (error) {
      console.error('Error revoking credential:', error);
      toast.error('Failed to revoke credential');
    }
  };

  // Delete a credential
  const handleDelete = async (tokenId) => {
    if (!window.confirm('Are you sure you want to permanently delete this credential?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/credentials-json/${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('Credential deleted successfully');
        fetchCredentials();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete credential');
      }
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = 
      (cred.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cred.tokenId?.toString() || '').includes(searchTerm.toLowerCase()) ||
      (cred.credentialType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cred.courseName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cred.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!testMode && !isConnected) {
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
              <h3>{institutionInfo?.name || institutionInfo?.institutionName || 'Institution Portal'}</h3>
              <p className="wallet-address">{institutionInfo?.email || (testMode ? 'Test Mode' : formatAddress(account))}</p>
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchCredentials} className="btn btn-secondary">
              <HiOutlineRefresh />
              Refresh
            </button>
            <Link to="/institution/issue" className="btn btn-primary">
              <HiOutlineDocumentAdd />
              Issue New
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, token ID, or type..."
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

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading credentials...</p>
          </div>
        ) : (
          <>
            {/* Credentials Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Token ID</th>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>Issue Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCredentials.map((cred) => (
                    <tr key={cred.tokenId}>
                      <td>
                        <code className="hash-code">#{cred.tokenId}</code>
                      </td>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {cred.studentName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div>{cred.studentName}</div>
                            <small className="wallet-small">{cred.studentEmail}</small>
                          </div>
                        </div>
                      </td>
                      <td>{cred.credentialType}</td>
                      <td>{cred.courseName}</td>
                      <td>{cred.grade || '—'}</td>
                      <td>{cred.issueDate ? new Date(cred.issueDate).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge badge-${cred.status === 'active' ? 'success' : cred.status === 'revoked' ? 'danger' : 'warning'}`}>
                          {cred.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" title="View">
                            <HiOutlineEye />
                          </button>
                          {cred.status === 'active' && (
                            <button 
                              className="action-btn warning" 
                              title="Revoke"
                              onClick={() => handleRevoke(cred.tokenId)}
                            >
                              <HiOutlineTrash />
                            </button>
                          )}
                          <button 
                            className="action-btn danger" 
                            title="Delete"
                            onClick={() => handleDelete(cred.tokenId)}
                          >
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
                  <p>{credentials.length === 0 ? 'Start by issuing your first credential' : 'Try adjusting your search or filter criteria'}</p>
                  {credentials.length === 0 && (
                    <Link to="/institution/issue" className="btn btn-primary" style={{ marginTop: '16px' }}>
                      Issue First Credential
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredCredentials.length > 0 && (
              <div className="pagination">
                <span className="pagination-info">Showing {filteredCredentials.length} of {credentials.length} credentials</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ManageCredentials;
