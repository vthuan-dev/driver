import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersAPI, requestsAPI, settingsAPI, adminAuthAPI } from '../../services/adminApi';
import FakeNotificationsTab from './FakeNotifications/FakeNotificationsTab';
import './Dashboard.css';

type User = {
  _id: string;
  name: string;
  phone: string;
  carType: string;
  carYear: string;
  carImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  isBanned?: boolean;
  banReason?: string;
  plainPassword?: string;
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
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'fake-notifications' | 'settings' | 'change-password'>('requests');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'waiting' | 'matched' | 'completed'>('waiting');
  const [userStatusFilter, setUserStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [bankConfig, setBankConfig] = useState<{ bankCode: string; bankName: string; accountNo: string; accountName: string }>({ bankCode: '', bankName: '', accountNo: '', accountName: '' });
  const [banksList, setBanksList] = useState<{ id: string; name: string; shortName: string; code: string }[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });

  // ── Income modal state ──
  const [incomeModalUser, setIncomeModalUser] = useState<User | null>(null);
  const [incomeForm, setIncomeForm] = useState({
    fakeIncomeAmount: '',
    fakeIncomeTips: '',
    historyRaw: '',  // JSON text, e.g. [{"date":"20/06","amount":1000000},...]
  });
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeMsg, setIncomeMsg] = useState('');

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      setUsers(response.data.users ?? []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await requestsAPI.getAllRequests();
      setRequests(response.data.requests ?? []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const [settingsRes, banksRes] = await Promise.all([
        settingsAPI.getSettings(),
        fetch('https://api.vietqr.io/v2/banks').then(r => r.json())
      ]);
      const s = settingsRes.data.data;
      if (s) {
        setBankConfig({
          bankCode: s.bankCode || '',
          bankName: s.bankName || '',
          accountNo: s.accountNo || '',
          accountName: s.accountName || ''
        });
      }
      if (banksRes.code === '00') {
        setBanksList(banksRes.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRequests();
    loadSettings();
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

  const handleBanUser = async (userId: string, userName: string) => {
    const reason = prompt(`Lý do khóa tài khoản "${userName}"? (để trống nếu không cần)`);
    if (reason === null) return;
    setLoading(true);
    try {
      await usersAPI.banUser(userId, reason);
      await loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Có lỗi xảy ra khi khóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    if (!confirm(`Mở khóa tài khoản "${userName}"?`)) return;
    setLoading(true);
    try {
      await usersAPI.unbanUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Có lỗi xảy ra khi mở khóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Xóa "${userName}" khỏi nhóm? Tài xế sẽ bị xóa khỏi hệ thống.`)) {
      return;
    }
    setLoading(true);
    try {
      await usersAPI.deleteUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Có lỗi xảy ra khi xóa tài xế');
    } finally {
      setLoading(false);
    }
  };

  // Open income modal for a specific user
  const openIncomeModal = (user: User) => {
    setIncomeModalUser(user);
    setIncomeForm({ fakeIncomeAmount: '', fakeIncomeTips: '', historyRaw: '' });
    setIncomeMsg('');
  };

  const handleSetIncome = async () => {
    if (!incomeModalUser) return;
    const amount = parseInt(incomeForm.fakeIncomeAmount.replace(/\D/g, ''), 10) || 0;
    const tips = parseInt(incomeForm.fakeIncomeTips.replace(/\D/g, ''), 10) || 0;
    let history: { date: string; amount: number }[] = [];
    if (incomeForm.historyRaw.trim()) {
      try {
        history = JSON.parse(incomeForm.historyRaw);
        if (!Array.isArray(history)) throw new Error('Not array');
      } catch {
        setIncomeMsg('❌ Lịch sử không đúng định dạng JSON');
        return;
      }
    } else {
      // Auto-generate history from today
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      if (amount + tips > 0) {
        history = [{ date: `${dd}/${mm}`, amount: amount + tips }];
      }
    }
    setIncomeLoading(true);
    try {
      await usersAPI.setDriverIncome(incomeModalUser._id, {
        fakeIncomeAmount: amount,
        fakeIncomeTips: tips,
        fakeIncomeHistory: history,
      });
      setIncomeMsg('✅ Đã cập nhật thu nhập thành công!');
      setTimeout(() => {
        setIncomeModalUser(null);
        setIncomeMsg('');
      }, 1500);
    } catch (err: any) {
      setIncomeMsg('❌ Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật'));
    } finally {
      setIncomeLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
      return;
    }
    
    setLoading(true);
    try {
      await requestsAPI.deleteRequest(requestId);
      await loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Có lỗi xảy ra khi xóa yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  // Filter function for phone number search
  const filterUsersByPhone = (userList: User[]): User[] => {
    if (!searchQuery.trim()) {
      return userList;
    }
    
    // Extract only numeric characters from search query
    const numericQuery = searchQuery.replace(/\D/g, '');
    
    if (!numericQuery) {
      return userList;
    }
    
    return userList.filter(user => 
      user.phone.replace(/\D/g, '').includes(numericQuery)
    );
  };

  const pendingUsers = users.filter(user => user.status === 'pending');
  const approvedUsers = users.filter(user => user.status === 'approved');
  const rejectedUsers = users.filter(user => user.status === 'rejected');

  // Apply search filter to user lists
  const filteredPendingUsers = filterUsersByPhone(pendingUsers);
  const filteredApprovedUsers = filterUsersByPhone(approvedUsers);
  const filteredRejectedUsers = filterUsersByPhone(rejectedUsers);
  
  // Filter requests by status
  const statusFilteredRequests =
    requestStatusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === requestStatusFilter);
  
  // Filter requests by phone search
  const filteredRequests = requestSearchQuery.trim()
    ? statusFilteredRequests.filter(request => {
        const numericQuery = requestSearchQuery.replace(/\D/g, '');
        return numericQuery && request.phone.replace(/\D/g, '').includes(numericQuery);
      })
    : statusFilteredRequests;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <button 
          className={`hamburger-menu ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
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
              <button 
                className={`tab ${activeTab === 'fake-notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('fake-notifications')}
              >
                <span>📢</span>
                <span>Quản lý thông báo ảo</span>
              </button>
              <button 
                className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span>⚙️</span>
                <span>Cấu hình ngân hàng</span>
              </button>
              <button 
                className={`tab ${activeTab === 'change-password' ? 'active' : ''}`}
                onClick={() => setActiveTab('change-password')}
              >
                <span>🔑</span>
                <span>Đổi mật khẩu</span>
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
              <button 
                className={`mobile-tab ${activeTab === 'fake-notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('fake-notifications')}
              >
                <span>📢</span>
                <span>Quản lý thông báo ảo</span>
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span>⚙️</span>
                <span>Cấu hình NH</span>
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'change-password' ? 'active' : ''}`}
                onClick={() => setActiveTab('change-password')}
              >
                <span>🔑</span>
                <span>Đổi MK</span>
              </button>
            </div>
          </div>

          <div className="tab-content">
          {activeTab === 'users' && (
            <div className="users-section">
              <h2>Danh sách người dùng</h2>
              
              {/* Search Input */}
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm theo số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Status filter tabs */}
              <div className="request-filter-tabs" style={{marginBottom: '16px'}}>
                <button
                  className={`filter-tab ${userStatusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setUserStatusFilter('pending')}
                >
                  Chờ phê duyệt ({pendingUsers.length})
                </button>
                <button
                  className={`filter-tab ${userStatusFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => setUserStatusFilter('approved')}
                >
                  Đã phê duyệt ({approvedUsers.length})
                </button>
                <button
                  className={`filter-tab ${userStatusFilter === 'rejected' ? 'active' : ''}`}
                  onClick={() => setUserStatusFilter('rejected')}
                >
                  Đã từ chối ({rejectedUsers.length})
                </button>
              </div>

              {/* No results message */}
              {searchQuery && filteredPendingUsers.length === 0 && filteredApprovedUsers.length === 0 && filteredRejectedUsers.length === 0 && (
                <div className="no-results">
                  <p>Không tìm thấy người dùng với số điện thoại "{searchQuery}"</p>
                </div>
              )}

              {(searchQuery ? filteredPendingUsers.length > 0 : userStatusFilter === 'pending' && filteredPendingUsers.length > 0) && (
                <div className="section">
                  <h3>Chờ phê duyệt ({filteredPendingUsers.length})</h3>
                  <div className="user-list">
                    {filteredPendingUsers.map(user => (
                      <motion.div 
                        key={user._id} 
                        className="user-card pending"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="user-avatar">
                          {user.carImage ? (
                            <img src={user.carImage} alt={`Xe cua ${user.name}`} />
                          ) : (
                            <span>CAR</span>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-phone">Tài khoản: {user.phone}</div>
                          {user.plainPassword && (
                            <div className="user-plain-password">Mật khẩu: <strong>{user.plainPassword}</strong></div>
                          )}
                          <div className="user-car">Tên phương tiện: {user.carType} - {user.carYear}</div>
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

              {(searchQuery ? filteredApprovedUsers.length > 0 : userStatusFilter === 'approved' && filteredApprovedUsers.length > 0) && (
                <div className="section">
                  <h3>Đã phê duyệt ({filteredApprovedUsers.length})</h3>
                  <div className="user-list">
                    {filteredApprovedUsers.map(user => (
                      <div key={user._id} className="user-card approved">
                        <div className="user-avatar">
                          {user.carImage ? (
                            <img src={user.carImage} alt={`Xe cua ${user.name}`} />
                          ) : (
                            <span>CAR</span>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-phone">Tài khoản: {user.phone}</div>
                          {user.plainPassword && (
                            <div className="user-plain-password">Mật khẩu: <strong>{user.plainPassword}</strong></div>
                          )}
                          <div className="user-car">Tên phương tiện: {user.carType} - {user.carYear}</div>
                          <div className="user-date">
                            Phê duyệt: {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </div>
                        <div className="user-actions">
                          {user.isBanned ? (
                            <div className="status-badge banned">Đã khóa</div>
                          ) : (
                            <div className="status-badge approved">Đã phê duyệt</div>
                          )}
                          {user.isBanned ? (
                            <button
                              className="unban-btn"
                              onClick={() => handleUnbanUser(user._id, user.name)}
                              disabled={loading}
                            >
                              Mở khóa
                            </button>
                          ) : (
                            <button
                              className="ban-btn"
                              onClick={() => handleBanUser(user._id, user.name)}
                              disabled={loading}
                            >
                              Khóa tài khoản
                            </button>
                          )}
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveUser(user._id, user.name)}
                            disabled={loading}
                          >
                            Xóa khỏi nhóm
                          </button>
                          <button
                            className="income-btn"
                            onClick={() => openIncomeModal(user)}
                            disabled={loading}
                          >
                            💵 Cài thu nhập
                          </button>                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(searchQuery ? filteredRejectedUsers.length > 0 : userStatusFilter === 'rejected' && filteredRejectedUsers.length > 0) && (
                <div className="section">
                  <h3>Đã từ chối ({filteredRejectedUsers.length})</h3>
                  <div className="user-list">
                    {filteredRejectedUsers.map(user => (
                      <div key={user._id} className="user-card rejected">
                        <div className="user-avatar">
                          {user.carImage ? (
                            <img src={user.carImage} alt={`Xe cua ${user.name}`} />
                          ) : (
                            <span>CAR</span>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-phone">Tài khoản: {user.phone}</div>
                          {user.plainPassword && (
                            <div className="user-plain-password">Mật khẩu: <strong>{user.plainPassword}</strong></div>
                          )}
                          <div className="user-car">Tên phương tiện: {user.carType} - {user.carYear}</div>
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

          {activeTab === 'fake-notifications' && (
            <FakeNotificationsTab />
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>⚙️ Cấu hình ngân hàng VietQR</h2>
              <p style={{ color: '#666', marginBottom: 20 }}>Thay đổi STK ngân hàng dùng cho toàn bộ QR thanh toán (đăng ký, mua app, hoàn tiền).</p>

              {settingsMessage && (
                <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: settingsMessage.includes('thành công') ? '#d4edda' : '#f8d7da', color: settingsMessage.includes('thành công') ? '#155724' : '#721c24' }}>
                  {settingsMessage}
                </div>
              )}

              <div className="settings-form" style={{ maxWidth: 480 }}>
                <label className="field" style={{ display: 'block', marginBottom: 16 }}>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Ngân hàng</span>
                  <select
                    value={bankConfig.bankCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const bank = banksList.find(b => b.code === code);
                      setBankConfig(prev => ({ ...prev, bankCode: code, bankName: bank?.shortName || bank?.name || '' }));
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    {banksList.map(bank => (
                      <option key={bank.id} value={bank.code}>
                        {bank.shortName || bank.name} ({bank.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field" style={{ display: 'block', marginBottom: 16 }}>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Số tài khoản</span>
                  <input
                    type="text"
                    value={bankConfig.accountNo}
                    onChange={(e) => setBankConfig(prev => ({ ...prev, accountNo: e.target.value.replace(/\D/g, '') }))}
                    placeholder="VD: 092480168"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
                  />
                </label>

                <label className="field" style={{ display: 'block', marginBottom: 16 }}>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Tên chủ tài khoản <small style={{ color: '#888' }}>(IN HOA, không dấu)</small></span>
                  <input
                    type="text"
                    value={bankConfig.accountName}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9\s]/g, '');
                      setBankConfig(prev => ({ ...prev, accountName: val }));
                    }}
                    placeholder="VD: HOANG MANH DUY"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
                  />
                </label>

                {bankConfig.bankCode && bankConfig.accountNo && (
                  <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Xem trước QR:</p>
                    <img
                      src={`https://img.vietqr.io/image/${bankConfig.bankCode}-${bankConfig.accountNo}-compact2.png?amount=200000&addInfo=Phi%20tham%20gia%20nhom&accountName=${encodeURIComponent(bankConfig.accountName || 'TEST')}`}
                      alt="Preview"
                      style={{ width: 240, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}
                    />
                  </div>
                )}

                <button
                  className="submit"
                  onClick={async () => {
                    if (!bankConfig.bankCode || !bankConfig.accountNo || !bankConfig.accountName) {
                      setSettingsMessage('Vui lòng nhập đầy đủ thông tin!');
                      setTimeout(() => setSettingsMessage(''), 3000);
                      return;
                    }
                    setSettingsLoading(true);
                    try {
                      await settingsAPI.updateSettings({
                        bankCode: bankConfig.bankCode,
                        bankName: bankConfig.bankName,
                        accountNo: bankConfig.accountNo,
                        accountName: bankConfig.accountName
                      });
                      setSettingsMessage('✅ Cập nhật thành công!');
                      setTimeout(() => setSettingsMessage(''), 3000);
                    } catch (err: any) {
                      setSettingsMessage('❌ Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật'));
                    } finally {
                      setSettingsLoading(false);
                    }
                  }}
                  disabled={settingsLoading}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, cursor: settingsLoading ? 'not-allowed' : 'pointer', opacity: settingsLoading ? 0.7 : 1 }}
                >
                  {settingsLoading ? 'Đang lưu...' : '💾 Lưu cấu hình'}
                </button>
              </div>

            </div>
          )}

          {activeTab === 'change-password' && (
            <div className="settings-section">
              <h2>🔑 Đổi mật khẩu Admin</h2>
              <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>Mật khẩu mới phải có ít nhất 6 ký tự.</p>

              {pwMessage && (
                <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: pwMessage.includes('thành công') ? '#d4edda' : '#f8d7da', color: pwMessage.includes('thành công') ? '#155724' : '#721c24' }}>
                  {pwMessage}
                </div>
              )}

              <div style={{ maxWidth: 420 }}>
                {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => {
                  const labels: Record<string, string> = { currentPassword: 'Mật khẩu hiện tại', newPassword: 'Mật khẩu mới', confirmPassword: 'Xác nhận mật khẩu mới' };
                  const keys: Record<string, keyof typeof pwShow> = { currentPassword: 'current', newPassword: 'next', confirmPassword: 'confirm' };
                  const showKey = keys[field];
                  return (
                    <div key={field} style={{ marginBottom: 16 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>{labels[field]}</span>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={pwShow[showKey] ? 'text' : 'password'}
                          value={pwForm[field]}
                          onChange={(e) => setPwForm(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          style={{ width: '100%', padding: '11px 42px 11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                        <button type="button" onClick={() => setPwShow(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', padding: 0 }}>
                          {pwShow[showKey] ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={async () => {
                    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
                      setPwMessage('Vui lòng nhập đầy đủ thông tin!'); setTimeout(() => setPwMessage(''), 3000); return;
                    }
                    if (pwForm.newPassword !== pwForm.confirmPassword) {
                      setPwMessage('Mật khẩu xác nhận không khớp!'); setTimeout(() => setPwMessage(''), 3000); return;
                    }
                    if (pwForm.newPassword.length < 6) {
                      setPwMessage('Mật khẩu mới phải có ít nhất 6 ký tự!'); setTimeout(() => setPwMessage(''), 3000); return;
                    }
                    setPwLoading(true);
                    try {
                      await adminAuthAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
                      setPwMessage('✅ Đổi mật khẩu thành công!');
                      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setTimeout(() => setPwMessage(''), 4000);
                    } catch (err: any) {
                      setPwMessage('❌ ' + (err.response?.data?.message || 'Không thể đổi mật khẩu'));
                      setTimeout(() => setPwMessage(''), 4000);
                    } finally { setPwLoading(false); }
                  }}
                  disabled={pwLoading}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#0f766e', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1, marginTop: 4 }}
                >
                  {pwLoading ? 'Đang xử lý...' : '🔑 Đổi mật khẩu'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-section">
            <div className="requests-header">
                <h2>Yêu cầu cuốc xe</h2>
                <p className="requests-subtitle">Lọc nhanh: chờ ghép, đã ghép, đã hoàn thành. Bạn có thể xóa bất kỳ cuốc nào.</p>
              
              {/* Search Input for Requests */}
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm theo số điện thoại..."
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                />
                {requestSearchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setRequestSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="request-filters">
                <button
                  className={`filter-btn ${requestStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setRequestStatusFilter('all')}
                >
                  Tất cả ({requests.length})
                </button>
                <button
                  className={`filter-btn ${requestStatusFilter === 'waiting' ? 'active' : ''}`}
                  onClick={() => setRequestStatusFilter('waiting')}
                >
                  Chờ ghép ({requests.filter(r => r.status === 'waiting').length})
                </button>
                <button
                  className={`filter-btn ${requestStatusFilter === 'matched' ? 'active' : ''}`}
                  onClick={() => setRequestStatusFilter('matched')}
                >
                  Đã ghép ({requests.filter(r => r.status === 'matched').length})
                </button>
                <button
                  className={`filter-btn ${requestStatusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setRequestStatusFilter('completed')}
                >
                  Hoàn thành ({requests.filter(r => r.status === 'completed').length})
                </button>
              </div>
            </div>
              
              {/* No results message */}
              {requestSearchQuery && filteredRequests.length === 0 && (
                <div className="no-results">
                  <p>Không tìm thấy yêu cầu với số điện thoại "{requestSearchQuery}"</p>
                </div>
              )}
              
              <div className="request-list">
              {filteredRequests.map(request => (
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
                      <button
                        className="ban-btn"
                        onClick={() => handleBanUser(request.userId, request.name)}
                        disabled={loading}
                        title="Khóa tài khoản tài xế"
                        style={{fontSize: '12px', padding: '6px 10px'}}
                      >
                        🔒 Khóa
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteRequest(request._id)}
                        disabled={loading}
                        title="Xóa yêu cầu"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ── Income Modal ───────────────────────────────────────── */}
      {incomeModalUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg,#1a2340 0%,#243252 100%)'
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>💵 Cài thu nhập ảo</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                  {incomeModalUser?.name} · {incomeModalUser?.phone}
                </div>
              </div>
              <button onClick={() => setIncomeModalUser(null)} style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 22,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 20px 24px' }}>
              {incomeMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                  background: incomeMsg.includes('✅') ? '#d1fae5' : '#fee2e2',
                  color: incomeMsg.includes('✅') ? '#065f46' : '#991b1b',
                  fontWeight: 600, fontSize: 14
                }}>{incomeMsg}</div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Cước xe hoàn thành (VNĐ)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 36000000"
                  value={incomeForm.fakeIncomeAmount}
                  onChange={e => setIncomeForm(f => ({ ...f, fakeIncomeAmount: e.target.value }))}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                {incomeForm.fakeIncomeAmount && !isNaN(parseInt(incomeForm.fakeIncomeAmount.replace(/\D/g,''),10)) && (
                  <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: 600 }}>
                    = {parseInt(incomeForm.fakeIncomeAmount.replace(/\D/g,''),10).toLocaleString('vi-VN')} VNĐ
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Tips khách hàng (VNĐ)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 82972"
                  value={incomeForm.fakeIncomeTips}
                  onChange={e => setIncomeForm(f => ({ ...f, fakeIncomeTips: e.target.value }))}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                {incomeForm.fakeIncomeTips && !isNaN(parseInt(incomeForm.fakeIncomeTips.replace(/\D/g,''),10)) && (
                  <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: 600 }}>
                    = {parseInt(incomeForm.fakeIncomeTips.replace(/\D/g,''),10).toLocaleString('vi-VN')} VNĐ
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  Lịch sử thanh toán <span style={{ fontWeight: 400, color: '#9ca3af' }}>(JSON, để trống = tự tạo)</span>
                </label>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  VD: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                    {`[{"date":"20/06","amount":1000000},{"date":"15/06","amount":800000}]`}
                  </code>
                </div>
                <textarea
                  rows={3}
                  placeholder={`[{"date":"20/06","amount":1000000}]`}
                  value={incomeForm.historyRaw}
                  onChange={e => setIncomeForm(f => ({ ...f, historyRaw: e.target.value }))}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'monospace', resize: 'vertical',
                    lineHeight: 1.6, transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Preview total */}
              {(incomeForm.fakeIncomeAmount || incomeForm.fakeIncomeTips) && (
                <div style={{
                  background: 'linear-gradient(135deg,#1a2340 0%,#243252 100%)',
                  borderRadius: 12, padding: '14px 18px', marginBottom: 18, color: '#fff'
                }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>Tổng thu nhập (xem trước)</div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>
                    {((parseInt(incomeForm.fakeIncomeAmount.replace(/\D/g,''),10)||0) + (parseInt(incomeForm.fakeIncomeTips.replace(/\D/g,''),10)||0)).toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleSetIncome}
                  disabled={incomeLoading}
                  style={{
                    flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: incomeLoading ? 'not-allowed' : 'pointer',
                    opacity: incomeLoading ? 0.7 : 1, transition: 'all 0.2s'
                  }}
                >
                  {incomeLoading ? 'Đang lưu...' : '💾 Lưu thu nhập'}
                </button>
                <button
                  onClick={() => setIncomeModalUser(null)}
                  style={{
                    flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
                    background: '#f3f4f6', color: '#6b7280', fontSize: 15, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
