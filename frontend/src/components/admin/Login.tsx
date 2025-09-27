import { useState } from 'react';
import { motion } from 'framer-motion';
import { adminAuthAPI } from '../../services/adminApi';
import './Login.css';

const Login = ({ onLogin }: { onLogin: (admin: any) => void }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAuthAPI.login(form);
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
      onLogin(response.data.admin);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <h1>Admin Panel</h1>
          <p>Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <motion.button
            type="submit"
            className="login-button"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            whileHover={{ filter: 'brightness(1.05)' }}
          >
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </motion.button>
        </form>

        <div className="login-footer">
          <p>Mặc định: admin / admin123</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
