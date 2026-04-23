import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fakeNotificationsAPI } from '../../../services/adminApi';
import FakeNotificationForm from './FakeNotificationForm';
import FakeNotificationList from './FakeNotificationList';
import FakeNotificationSettings from './FakeNotificationSettings';
import './FakeNotifications.css';

type Region = 'north' | 'central' | 'south';
type CarType = '4' | '7' | '16';

export type FakeNotification = {
  _id: string;
  region: Region;
  startPoint: string;
  endPoint: string;
  displayTime: string;
  carType: CarType;
  price: number;
  isActive: boolean;
  note?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

const FakeNotificationsTab = () => {
  const [templates, setTemplates] = useState<FakeNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FakeNotification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fakeNotificationsAPI.getAll();
      setTemplates(response.data.data.templates);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      setError('Lỗi khi tải danh sách template');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEdit = (template: FakeNotification) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTemplate) {
        // Update
        await fakeNotificationsAPI.update(editingTemplate._id, data);
        setSuccess('Cập nhật template thành công');
      } else {
        // Create
        await fakeNotificationsAPI.create(data);
        setSuccess('Tạo template thành công');
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      await loadTemplates();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError(error.response?.data?.message || 'Lỗi khi lưu template');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa template này?')) {
      return;
    }

    try {
      await fakeNotificationsAPI.delete(id);
      setSuccess('Xóa template thành công');
      await loadTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setError('Lỗi khi xóa template');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fakeNotificationsAPI.toggle(id);
      await loadTemplates();
    } catch (error: any) {
      console.error('Error toggling template:', error);
      setError('Lỗi khi bật/tắt template');
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="fake-notifications-tab">
      <div className="tab-header">
        <h2>📢 Quản lý thông báo ảo</h2>
        <p className="tab-subtitle">
          Tạo và quản lý các template thông báo ảo cuốc xe theo vùng miền
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div 
          className="alert alert-success"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ {success}
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          className="alert alert-error"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✗ {error}
        </motion.div>
      )}

      {/* Settings Form */}
      {!showForm && <FakeNotificationSettings />}

      {/* Create Button */}
      {!showForm && (
        <div className="actions-bar">
          <button className="btn-create" onClick={handleCreate}>
            ➕ Tạo thông báo mới
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <FakeNotificationForm
          template={editingTemplate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <FakeNotificationList
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
};

export default FakeNotificationsTab;
