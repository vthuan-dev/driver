import { useState, useEffect } from 'react';
import { settingsAPI } from '../../../services/adminApi';

type Settings = {
  minFakeCount: number;
  maxFakeCount: number;
  minFakeInterval: number;
  maxFakeInterval: number;
};

const FakeNotificationSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    minFakeCount: 3,
    maxFakeCount: 4,
    minFakeInterval: 15,
    maxFakeInterval: 30
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.getSettings();
      if (res.data && res.data.data) {
        setSettings({
          minFakeCount: res.data.data.minFakeCount || 3,
          maxFakeCount: res.data.data.maxFakeCount || 4,
          minFakeInterval: res.data.data.minFakeInterval || 15,
          maxFakeInterval: res.data.data.maxFakeInterval || 30
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await settingsAPI.updateSettings(settings);
      setMessage({ text: 'Lưu cài đặt thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage({ text: error.response?.data?.message || 'Lỗi khi lưu cài đặt', type: 'error' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Đang tải cài đặt...</div>;

  return (
    <div className="settings-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>⚙️ Cài đặt hiển thị random</h3>
      
      {message && (
        <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#555' }}>Số thông báo/khung giờ:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#777' }}>Min</span>
              <input 
                type="number" 
                min="1"
                value={settings.minFakeCount} 
                onChange={(e) => setSettings({...settings, minFakeCount: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <span style={{ marginTop: '15px' }}>-</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#777' }}>Max</span>
              <input 
                type="number" 
                min="1"
                value={settings.maxFakeCount} 
                onChange={(e) => setSettings({...settings, maxFakeCount: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#555' }}>Khoảng thời gian random (phút):</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#777' }}>Min</span>
              <input 
                type="number" 
                min="1"
                value={settings.minFakeInterval} 
                onChange={(e) => setSettings({...settings, minFakeInterval: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <span style={{ marginTop: '15px' }}>-</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#777' }}>Max</span>
              <input 
                type="number" 
                min="1"
                value={settings.maxFakeInterval} 
                onChange={(e) => setSettings({...settings, maxFakeInterval: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: '#00B14F', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu cài đặt'}
        </button>
      </div>
    </div>
  );
};

export default FakeNotificationSettings;
