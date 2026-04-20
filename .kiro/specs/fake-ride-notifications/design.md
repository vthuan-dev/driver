# Design Document - Fake Ride Notifications Management

## Overview

Thiết kế hệ thống quản lý thông báo ảo cuốc xe cho Web Admin Dashboard. Hệ thống cho phép admin tạo, sửa, xóa và bật/tắt các template thông báo ảo theo vùng miền.

## Database Design

### FakeNotification Model (MongoDB)

```javascript
{
  _id: ObjectId,
  region: String,        // 'north' | 'central' | 'south'
  startPoint: String,    // Điểm đi
  endPoint: String,      // Điểm đến
  displayTime: String,   // "08:00", "12:00", "19:00", "22:00"
  carType: String,       // '4' | '7' | '16'
  price: Number,         // Giá tiền (VND)
  isActive: Boolean,     // Trạng thái bật/tắt (default: true)
  createdBy: ObjectId,   // Admin ID
  createdAt: Date,       // Timestamp tạo
  updatedAt: Date        // Timestamp cập nhật
}
```

**Indexes:**
- `region` (for filtering by region)
- `isActive` (for filtering active templates)
- Compound index: `{ region: 1, isActive: 1 }`

**Validation:**
- `region`: required, enum ['north', 'central', 'south']
- `startPoint`: required, minLength: 2
- `endPoint`: required, minLength: 2
- `displayTime`: required, format: HH:MM
- `carType`: required, enum ['4', '7', '16']
- `price`: required, min: 0
- `isActive`: required, boolean, default: true

## Backend Architecture

### File Structure

```
backend/src/
├── models/
│   └── FakeNotification.js          # Mongoose model
├── controllers/
│   └── fakeNotificationController.js # CRUD logic
├── routes/
│   └── fakeNotifications.js         # API routes
└── middleware/
    └── auth.js                       # Existing auth middleware
```

### API Endpoints

#### 1. Create Template
```
POST /api/admin/fake-notifications
Headers: Authorization: Bearer <token>
Body: {
  region: 'north',
  startPoint: 'Hà Nội',
  endPoint: 'Ninh Bình',
  displayTime: '08:00',
  carType: '7',
  price: 1200000,
  isActive: true
}
Response: 201 Created
{
  success: true,
  data: { ...template }
}
```

#### 2. Get All Templates
```
GET /api/admin/fake-notifications
Headers: Authorization: Bearer <token>
Response: 200 OK
{
  success: true,
  data: {
    templates: [...],
    count: 10
  }
}
```

#### 3. Update Template
```
PUT /api/admin/fake-notifications/:id
Headers: Authorization: Bearer <token>
Body: { ...updated fields }
Response: 200 OK
{
  success: true,
  data: { ...updated template }
}
```

#### 4. Delete Template
```
DELETE /api/admin/fake-notifications/:id
Headers: Authorization: Bearer <token>
Response: 200 OK
{
  success: true,
  message: 'Template deleted successfully'
}
```

#### 5. Toggle Active Status
```
PATCH /api/admin/fake-notifications/:id/toggle
Headers: Authorization: Bearer <token>
Response: 200 OK
{
  success: true,
  data: { ...template with toggled isActive }
}
```

### Controller Methods

```javascript
// fakeNotificationController.js
exports.createTemplate = async (req, res) => { ... }
exports.getAllTemplates = async (req, res) => { ... }
exports.getTemplateById = async (req, res) => { ... }
exports.updateTemplate = async (req, res) => { ... }
exports.deleteTemplate = async (req, res) => { ... }
exports.toggleTemplate = async (req, res) => { ... }
```

### Error Handling

- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (not admin)
- 404: Not Found (template doesn't exist)
- 500: Internal Server Error

## Frontend Architecture

### Component Structure

```
frontend/src/components/admin/
├── Dashboard.tsx                     # Updated with new tab
├── Dashboard.css                     # Updated styles
└── FakeNotifications/
    ├── FakeNotificationsTab.tsx      # Main container
    ├── FakeNotificationForm.tsx      # Create/Edit form
    ├── FakeNotificationList.tsx      # List grouped by region
    ├── FakeNotificationCard.tsx      # Single template card
    └── FakeNotifications.css         # Styles
```

### Component Hierarchy

```
Dashboard
└── FakeNotificationsTab
    ├── FakeNotificationForm (modal/inline)
    └── FakeNotificationList
        └── FakeNotificationCard (multiple)
```

### State Management

#### FakeNotificationsTab State:
```typescript
const [templates, setTemplates] = useState<Template[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [showForm, setShowForm] = useState(false)
const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
```

#### FakeNotificationForm State:
```typescript
const [formData, setFormData] = useState({
  region: 'north',
  startPoint: '',
  endPoint: '',
  displayTime: '08:00',
  carType: '7',
  price: 0,
  isActive: true
})
const [errors, setErrors] = useState<Record<string, string>>({})
const [submitting, setSubmitting] = useState(false)
```

### API Service

Update `frontend/src/services/adminApi.ts`:

```typescript
export const fakeNotificationsAPI = {
  getAll: () => api.get('/admin/fake-notifications'),
  create: (data: FakeNotificationInput) => 
    api.post('/admin/fake-notifications', data),
  update: (id: string, data: FakeNotificationInput) => 
    api.put(`/admin/fake-notifications/${id}`, data),
  delete: (id: string) => 
    api.delete(`/admin/fake-notifications/${id}`),
  toggle: (id: string) => 
    api.patch(`/admin/fake-notifications/${id}/toggle`)
}
```

### TypeScript Types

```typescript
type Region = 'north' | 'central' | 'south'
type CarType = '4' | '7' | '16'

interface FakeNotification {
  _id: string
  region: Region
  startPoint: string
  endPoint: string
  displayTime: string
  carType: CarType
  price: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface FakeNotificationInput {
  region: Region
  startPoint: string
  endPoint: string
  displayTime: string
  carType: CarType
  price: number
  isActive: boolean
}
```

## UI/UX Design

### Tab Integration

Add new tab to Dashboard sidebar:
```tsx
<button 
  className={`tab ${activeTab === 'fake-notifications' ? 'active' : ''}`}
  onClick={() => setActiveTab('fake-notifications')}
>
  <span>📢</span>
  <span>Quản lý thông báo ảo</span>
</button>
```

### Form Layout

```
┌──────────────────────────────────────────┐
│ 📢 Tạo thông báo ảo mới                  │
├──────────────────────────────────────────┤
│                                           │
│ Vùng miền *                               │
│ ┌─────────────────────────────────────┐  │
│ │ Miền Bắc                         ▼ │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Điểm đi *                                 │
│ ┌─────────────────────────────────────┐  │
│ │ Hà Nội                              │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Điểm đến *                                │
│ ┌─────────────────────────────────────┐  │
│ │ Ninh Bình                           │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Giờ hiển thị *                            │
│ ┌─────────────────────────────────────┐  │
│ │ 08:00                               │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Loại xe *                                 │
│ ┌─────────────────────────────────────┐  │
│ │ 7 chỗ                            ▼ │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Giá tiền (VND) *                          │
│ ┌─────────────────────────────────────┐  │
│ │ 1,200,000                           │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Trạng thái                                │
│ ┌─────────────────────────────────────┐  │
│ │ [●────] Bật                         │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ ┌─────────┐  ┌─────────┐                 │
│ │   Lưu   │  │   Hủy   │                 │
│ └─────────┘  └─────────┘                 │
└──────────────────────────────────────────┘
```

### List Layout

```
┌──────────────────────────────────────────┐
│ 📢 Danh sách thông báo ảo                │
│                                           │
│ [+ Tạo mới]                               │
├──────────────────────────────────────────┤
│                                           │
│ 🗺️ Miền Bắc (5 thông báo)                │
│ ┌────────────────────────────────────┐   │
│ │ 🕐 08:00 | Hà Nội → Ninh Bình      │   │
│ │ 🚗 7 chỗ | 1.200.000đ              │   │
│ │ [●────] Bật  [✏️ Sửa] [🗑️ Xóa]    │   │
│ └────────────────────────────────────┘   │
│ ┌────────────────────────────────────┐   │
│ │ 🕐 12:00 | Hà Nội → Thanh Hóa      │   │
│ │ 🚗 4 chỗ | 800.000đ                │   │
│ │ [────●] Tắt  [✏️ Sửa] [🗑️ Xóa]    │   │
│ └────────────────────────────────────┘   │
│                                           │
│ 🗺️ Miền Trung (3 thông báo)              │
│ ...                                       │
│                                           │
│ 🗺️ Miền Nam (4 thông báo)                │
│ ...                                       │
└──────────────────────────────────────────┘
```

### Card Component

```tsx
<div className="fake-notification-card">
  <div className="card-header">
    <span className="time">🕐 {displayTime}</span>
    <span className="route">{startPoint} → {endPoint}</span>
  </div>
  <div className="card-body">
    <span className="car-type">🚗 {carType} chỗ</span>
    <span className="price">{price.toLocaleString()}đ</span>
  </div>
  <div className="card-actions">
    <Toggle checked={isActive} onChange={handleToggle} />
    <button onClick={handleEdit}>✏️ Sửa</button>
    <button onClick={handleDelete}>🗑️ Xóa</button>
  </div>
</div>
```

## Validation Rules

### Frontend Validation

```typescript
const validateForm = (data: FakeNotificationInput): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.region) {
    errors.region = 'Vui lòng chọn vùng miền'
  }
  
  if (!data.startPoint || data.startPoint.length < 2) {
    errors.startPoint = 'Điểm đi phải có ít nhất 2 ký tự'
  }
  
  if (!data.endPoint || data.endPoint.length < 2) {
    errors.endPoint = 'Điểm đến phải có ít nhất 2 ký tự'
  }
  
  if (!data.displayTime || !/^\d{2}:\d{2}$/.test(data.displayTime)) {
    errors.displayTime = 'Giờ hiển thị không hợp lệ (HH:MM)'
  }
  
  if (!data.carType) {
    errors.carType = 'Vui lòng chọn loại xe'
  }
  
  if (!data.price || data.price <= 0) {
    errors.price = 'Giá tiền phải lớn hơn 0'
  }
  
  return errors
}
```

### Backend Validation

```javascript
const validateTemplate = (data) => {
  const errors = []
  
  if (!['north', 'central', 'south'].includes(data.region)) {
    errors.push('Invalid region')
  }
  
  if (!data.startPoint || data.startPoint.length < 2) {
    errors.push('Start point must be at least 2 characters')
  }
  
  if (!data.endPoint || data.endPoint.length < 2) {
    errors.push('End point must be at least 2 characters')
  }
  
  if (!['4', '7', '16'].includes(data.carType)) {
    errors.push('Invalid car type')
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0')
  }
  
  return errors
}
```

## Styling Guidelines

### Color Scheme (matching existing Dashboard)

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Card background */
background: rgba(255, 255, 255, 0.98);
backdrop-filter: blur(30px);

/* Active state */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Inactive state */
background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

/* Hover effects */
transform: translateY(-4px);
box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
```

### Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1025px) { ... }

/* Tablet */
@media (max-width: 1024px) { ... }

/* Mobile */
@media (max-width: 768px) { ... }
```

## Security Considerations

1. **Authentication**: All endpoints require valid admin token
2. **Authorization**: Only admins can access fake-notifications endpoints
3. **Input Sanitization**: Sanitize all user inputs to prevent XSS
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **CORS**: Configure CORS to allow only trusted origins

## Performance Optimization

1. **Database Indexing**: Index on `region` and `isActive` fields
2. **Pagination**: Implement pagination for large template lists (future)
3. **Caching**: Cache template list on frontend (invalidate on CRUD)
4. **Lazy Loading**: Load templates only when tab is active
5. **Debouncing**: Debounce search/filter inputs

## Testing Strategy

### Backend Tests
- Unit tests for controller methods
- Integration tests for API endpoints
- Validation tests for input data

### Frontend Tests
- Component rendering tests
- Form validation tests
- API integration tests
- User interaction tests

## Deployment Checklist

- [ ] Create FakeNotification model
- [ ] Create controller and routes
- [ ] Update server.js with new route
- [ ] Create frontend components
- [ ] Update adminApi.ts
- [ ] Update Dashboard.tsx
- [ ] Add CSS styles
- [ ] Test all CRUD operations
- [ ] Test responsive design
- [ ] Deploy to production
