# Tasks - Fake Ride Notifications Management

## Backend Tasks

### Task 1: Create FakeNotification Model
**Status:** pending
**Priority:** high
**Dependencies:** none

Create Mongoose model for fake notifications.

**Files to create:**
- `backend/src/models/FakeNotification.js`

**Implementation:**
```javascript
const mongoose = require('mongoose');

const fakeNotificationSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    enum: ['north', 'central', 'south']
  },
  startPoint: {
    type: String,
    required: true,
    minlength: 2
  },
  endPoint: {
    type: String,
    required: true,
    minlength: 2
  },
  displayTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  carType: {
    type: String,
    required: true,
    enum: ['4', '7', '16']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
fakeNotificationSchema.index({ region: 1 });
fakeNotificationSchema.index({ isActive: 1 });
fakeNotificationSchema.index({ region: 1, isActive: 1 });

module.exports = mongoose.model('FakeNotification', fakeNotificationSchema);
```

---

### Task 2: Create FakeNotification Controller
**Status:** pending
**Priority:** high
**Dependencies:** Task 1

Create controller with CRUD operations.

**Files to create:**
- `backend/src/controllers/fakeNotificationController.js`

**Methods to implement:**
- `createTemplate` - Create new template
- `getAllTemplates` - Get all templates
- `getTemplateById` - Get single template
- `updateTemplate` - Update template
- `deleteTemplate` - Delete template
- `toggleTemplate` - Toggle isActive status

---

### Task 3: Create FakeNotification Routes
**Status:** pending
**Priority:** high
**Dependencies:** Task 2

Create Express routes for fake notifications.

**Files to create:**
- `backend/src/routes/fakeNotifications.js`

**Routes:**
- `POST /api/admin/fake-notifications`
- `GET /api/admin/fake-notifications`
- `GET /api/admin/fake-notifications/:id`
- `PUT /api/admin/fake-notifications/:id`
- `DELETE /api/admin/fake-notifications/:id`
- `PATCH /api/admin/fake-notifications/:id/toggle`

---

### Task 4: Update Server with New Route
**Status:** pending
**Priority:** high
**Dependencies:** Task 3

Add fake notifications route to server.js.

**Files to modify:**
- `backend/src/server.js`

**Changes:**
```javascript
app.use('/api/admin/fake-notifications', require('./routes/fakeNotifications'));
```

---

## Frontend Tasks

### Task 5: Update AdminAPI Service
**Status:** pending
**Priority:** high
**Dependencies:** none

Add fake notifications API calls to adminApi.ts.

**Files to modify:**
- `frontend/src/services/adminApi.ts`

**Add:**
```typescript
export const fakeNotificationsAPI = {
  getAll: () => api.get('/admin/fake-notifications'),
  create: (data: any) => api.post('/admin/fake-notifications', data),
  update: (id: string, data: any) => api.put(`/admin/fake-notifications/${id}`, data),
  delete: (id: string) => api.delete(`/admin/fake-notifications/${id}`),
  toggle: (id: string) => api.patch(`/admin/fake-notifications/${id}/toggle`)
};
```

---

### Task 6: Create FakeNotificationCard Component
**Status:** pending
**Priority:** medium
**Dependencies:** Task 5

Create card component for displaying single template.

**Files to create:**
- `frontend/src/components/admin/FakeNotifications/FakeNotificationCard.tsx`

**Props:**
- `template: FakeNotification`
- `onEdit: (template) => void`
- `onDelete: (id) => void`
- `onToggle: (id) => void`

---

### Task 7: Create FakeNotificationForm Component
**Status:** pending
**Priority:** high
**Dependencies:** Task 5

Create form component for create/edit operations.

**Files to create:**
- `frontend/src/components/admin/FakeNotifications/FakeNotificationForm.tsx`

**Features:**
- Form validation
- Region dropdown
- Car type dropdown
- Time picker
- Price input with formatting
- Toggle for isActive
- Submit/Cancel buttons

---

### Task 8: Create FakeNotificationList Component
**Status:** pending
**Priority:** medium
**Dependencies:** Task 6

Create list component grouped by regions.

**Files to create:**
- `frontend/src/components/admin/FakeNotifications/FakeNotificationList.tsx`

**Features:**
- Group templates by region
- Display count per region
- Empty state message
- Loading state

---

### Task 9: Create FakeNotificationsTab Component
**Status:** pending
**Priority:** high
**Dependencies:** Task 7, Task 8

Create main tab component.

**Files to create:**
- `frontend/src/components/admin/FakeNotifications/FakeNotificationsTab.tsx`

**Features:**
- Load templates on mount
- Show/hide form
- Handle CRUD operations
- Error handling
- Success notifications

---

### Task 10: Create FakeNotifications Styles
**Status:** pending
**Priority:** medium
**Dependencies:** Task 6, Task 7, Task 8, Task 9

Create CSS styles for fake notifications components.

**Files to create:**
- `frontend/src/components/admin/FakeNotifications/FakeNotifications.css`

**Styles:**
- Match existing Dashboard design
- Responsive layout
- Card styles
- Form styles
- Animations

---

### Task 11: Update Dashboard Component
**Status:** pending
**Priority:** high
**Dependencies:** Task 9

Add fake notifications tab to Dashboard.

**Files to modify:**
- `frontend/src/components/admin/Dashboard.tsx`

**Changes:**
- Add new tab state: `'users' | 'requests' | 'fake-notifications'`
- Add tab button in sidebar
- Add tab button in mobile navigation
- Import and render FakeNotificationsTab

---

### Task 12: Update Dashboard Styles
**Status:** pending
**Priority:** low
**Dependencies:** Task 11

Update Dashboard CSS if needed.

**Files to modify:**
- `frontend/src/components/admin/Dashboard.css`

**Changes:**
- Ensure new tab styles match existing tabs
- Add any specific styles for fake notifications tab

---

## Testing Tasks

### Task 13: Test Backend APIs
**Status:** pending
**Priority:** high
**Dependencies:** Task 1, Task 2, Task 3, Task 4

Test all backend endpoints.

**Test cases:**
- Create template with valid data
- Create template with invalid data
- Get all templates
- Get single template
- Update template
- Delete template
- Toggle template
- Authentication/Authorization

---

### Task 14: Test Frontend Components
**Status:** pending
**Priority:** high
**Dependencies:** Task 6, Task 7, Task 8, Task 9

Test all frontend components.

**Test cases:**
- Form validation
- Create template
- Edit template
- Delete template (with confirmation)
- Toggle template
- List display
- Responsive design

---

## Implementation Order

1. **Backend First:**
   - Task 1: Create Model
   - Task 2: Create Controller
   - Task 3: Create Routes
   - Task 4: Update Server
   - Task 13: Test Backend

2. **Frontend Second:**
   - Task 5: Update AdminAPI
   - Task 6: Create Card Component
   - Task 7: Create Form Component
   - Task 8: Create List Component
   - Task 9: Create Tab Component
   - Task 10: Create Styles
   - Task 11: Update Dashboard
   - Task 12: Update Dashboard Styles
   - Task 14: Test Frontend

## Estimated Time

- Backend: 3-4 hours
- Frontend: 4-5 hours
- Testing: 1-2 hours
- **Total: 8-11 hours**

## Notes

- Follow existing code patterns in the project
- Use TypeScript for frontend components
- Match existing Dashboard UI/UX design
- Ensure responsive design works on mobile
- Add proper error handling and loading states
- Use framer-motion for animations (like existing Dashboard)
