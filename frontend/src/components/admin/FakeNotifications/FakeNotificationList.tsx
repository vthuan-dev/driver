import FakeNotificationCard from './FakeNotificationCard';
import type { FakeNotification } from './FakeNotificationsTab';

type Props = {
  templates: FakeNotification[];
  onEdit: (template: FakeNotification) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

const regionLabels = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam'
};

const FakeNotificationList = ({ templates, onEdit, onDelete, onToggle }: Props) => {
  // Group templates by region
  const groupedTemplates = {
    north: templates.filter(t => t.region === 'north'),
    central: templates.filter(t => t.region === 'central'),
    south: templates.filter(t => t.region === 'south')
  };

  if (templates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📢</div>
        <h3>Chưa có thông báo ảo nào</h3>
        <p>Nhấn "Tạo thông báo mới" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="fake-notification-list">
      {(['north', 'central', 'south'] as const).map(region => {
        const regionTemplates = groupedTemplates[region];
        
        if (regionTemplates.length === 0) return null;

        return (
          <div key={region} className="region-section">
            <h3 className="region-title">
              🗺️ {regionLabels[region]} ({regionTemplates.length} thông báo)
            </h3>
            <div className="templates-grid">
              {regionTemplates.map(template => (
                <FakeNotificationCard
                  key={template._id}
                  template={template}
                  onEdit={() => onEdit(template)}
                  onDelete={() => onDelete(template._id)}
                  onToggle={() => onToggle(template._id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FakeNotificationList;
