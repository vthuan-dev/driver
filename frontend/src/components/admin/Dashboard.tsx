import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersAPI, requestsAPI } from '../../services/adminApi';
import './Dashboard.css';

type User = {
  _id: string;
  name: string;
  phone: string;
  carType: string;
  carYear: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
};

type Request = {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  startPoint: string;
  endPoint: string;
  price: number;
  note: string;
  status: 'waiting' | 'matched' | 'completed';
  createdAt: string;
};

const Dashboard = ({ admin, onLogout }: { admin: any; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await requestsAPI.getAllRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRequests();
  }, []);

  const handleApproveUser = async (userId: string) => {
    setLoading(true);
    try {
      await usersAPI.approveUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setLoading(true);
    try {
      await usersAPI.rejectUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingUsers = users.filter(user => user.status === 'pending');
  const approvedUsers = users.filter(user => user.status === 'approved');
  const rejectedUsers = users.filter(user => user.status === 'rejected');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <button 
          className="hamburger-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <div className="header-content">
          <h1>Admin Dashboard</h1>
        </div>
      </header>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="dashboard-content">
        <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <div className="admin-profile">
              <div className="admin-avatar">👤</div>
              <div className="admin-details">
                <h3>Xin chào, {admin.username}</h3>
                <p>Quản trị viên</p>
              </div>
            </div>
            <button onClick={onLogout} className="logout-button">
              🚪 Đăng xuất
            </button>
          </div>

          <div className="sidebar-section">
            <h3>🧭 Điều hướng</h3>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span>👥</span>
                <span>Quản lý người dùng</span>
              </button>
              <button 
                className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <span>📋</span>
                <span>Yêu cầu chờ cuốc</span>
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Statistics Section - Outside sidebar */}
          <div className="stats-section">
            <h2>📊 Thống kê tổng quan</h2>
            <div className="stats-grid">
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="stat-icon">⏳</div>
                <div className="stat-number">{pendingUsers.length}</div>
                <div className="stat-label">Chờ phê duyệt</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="stat-icon">✅</div>
                <div className="stat-number">{approvedUsers.length}</div>
                <div className="stat-label">Đã phê duyệt</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="stat-icon">🚗</div>
                <div className="stat-number">{requests.length}</div>
                <div className="stat-label">Yêu cầu chờ cuốc</div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Navigation - Outside sidebar */}
          <div className="mobile-navigation">
            <h2>🧭 Điều hướng</h2>
            <div className="mobile-tabs">
              <button 
                className={`mobile-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span>👥</span>
                <span>Quản lý người dùng</span>
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <span>📋</span>
                <span>Yêu cầu chờ cuốc</span>
              </button>
            </div>
          </div>

          <div className="tab-content">
          {activeTab === 'users' && (
            <div className="users-section">
              <h2>Danh sách người dùng</h2>
              
              {pendingUsers.length > 0 && (
                <div className="section">
                  <h3>Chờ phê duyệt ({pendingUsers.length})</h3>
                  <div className="user-list">
                    {pendingUsers.map(user => (
                      <motion.div 
                        key={user._id} 
                        className="user-card pending"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-phone">{user.phone}</div>
                          <div className="user-car">{user.carType} - {user.carYear}</div>
                          <div className="user-date">
                            Đăng ký: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="user-actions">
                          <button 
                            className="approve-btn"
                            onClick={() => handleApproveUser(user._id)}
                            disabled={loading}
                          >
                            Phê duyệt
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleRejectUser(user._id)}
                            disabled={loading}
                          >
                            Từ chối
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {approvedUsers.length > 0 && (
                <div className="section">
                  <h3>Đã phê duyệt ({approvedUsers.length})</h3>
                  <div className="user-list">
                    {approvedUsers.map(user => (
                      <div key={user._id} className="user-card approved">
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-phone">{user.phone}</div>
                          <div className="user-car">{user.carType} - {user.carYear}</div>
                          <div className="user-date">
                            Phê duyệt: {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </div>
                        <div className="status-badge approved">Đã phê duyệt</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rejectedUsers.length > 0 && (
                <div className="section">
                  <h3>Đã từ chối ({rejectedUsers.length})</h3>
                  <div className="user-list">
                    {rejectedUsers.map(user => (
                      <div key={user._id} className="user-card rejected">
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-phone">{user.phone}</div>
                          <div className="user-car">{user.carType} - {user.carYear}</div>
                          <div className="user-date">
                            Từ chối: {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </div>
                        <div className="status-badge rejected">Đã từ chối</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-section">
              <h2>Yêu cầu chờ cuốc xe</h2>
              <div className="request-list">
                {requests.map(request => (
                  <motion.div 
                    key={request._id} 
                    className="request-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="request-info">
                      <div className="request-header">
                        <div className="request-name">{request.name}</div>
                        <div className="request-phone">{request.phone}</div>
                      </div>
                      <div className="request-route">
                        {request.startPoint} ⇄ {request.endPoint}
                      </div>
                      <div className="request-price">
                        Giá: {request.price.toLocaleString('vi-VN')} VND
                      </div>
                      {request.note && (
                        <div className="request-note">
                          Ghi chú: {request.note}
                        </div>
                      )}
                      <div className="request-date">
                        {new Date(request.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className="request-status">
                      <span className={`status-badge ${request.status}`}>
                        {request.status === 'waiting' ? 'Chờ ghép' : 
                         request.status === 'matched' ? 'Đã ghép' : 'Hoàn thành'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
