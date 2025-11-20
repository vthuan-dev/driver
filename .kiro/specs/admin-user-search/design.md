# Design Document

## Overview

This feature adds a phone number search capability to the admin dashboard's user management interface. The search will be implemented as a client-side filtering mechanism that works with the existing user data already loaded from the backend. The design focuses on providing a responsive, real-time search experience with minimal changes to the existing architecture.

## Architecture

### Component Structure

The search functionality will be integrated into the existing `Dashboard.tsx` component without requiring new components. The implementation will follow React's state management patterns using hooks.

```
Dashboard Component
├── Search Input (new)
│   ├── Text Input Field
│   └── Clear Button (conditional)
├── User List (existing - modified)
│   ├── Pending Users Section
│   ├── Approved Users Section
│   └── Rejected Users Section
└── Existing Actions (unchanged)
```

### Data Flow

1. User types in search input → State update triggers
2. React re-renders with filtered user list
3. Filter function applies to all user arrays (pending, approved, rejected)
4. Filtered results display with existing user card components
5. User actions (approve/reject) work on filtered results
6. After action, data reloads and filter re-applies

## Components and Interfaces

### State Management

**New State Variables:**
```typescript
const [searchQuery, setSearchQuery] = useState<string>('');
```

**Existing State (no changes):**
```typescript
const [users, setUsers] = useState<User[]>([]);
const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
const [loading, setLoading] = useState(false);
```

### Search Input Component (Inline JSX)

The search input will be added as inline JSX within the `users-section` div, positioned above the user list sections.

**Structure:**
```tsx
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
```

### Filter Logic

**Filter Function:**
```typescript
const filterUsersByPhone = (users: User[]): User[] => {
  if (!searchQuery.trim()) {
    return users;
  }
  
  // Extract only numeric characters from search query
  const numericQuery = searchQuery.replace(/\D/g, '');
  
  if (!numericQuery) {
    return users;
  }
  
  return users.filter(user => 
    user.phone.replace(/\D/g, '').includes(numericQuery)
  );
};
```

**Application:**
```typescript
const filteredPendingUsers = filterUsersByPhone(pendingUsers);
const filteredApprovedUsers = filterUsersByPhone(approvedUsers);
const filteredRejectedUsers = filterUsersByPhone(rejectedUsers);
```

### Empty State Display

When no results match the search query:

```tsx
{filteredPendingUsers.length === 0 && searchQuery && (
  <div className="no-results">
    <p>Không tìm thấy người dùng với số điện thoại "{searchQuery}"</p>
  </div>
)}
```

## Data Models

No changes to existing data models. The feature uses the existing `User` type:

```typescript
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
};
```

## Styling

### CSS Classes (to be added to Dashboard.css)

```css
.search-container {
  position: relative;
  margin-bottom: 30px;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 14px;
}

.clear-search-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #1f2937;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  margin: 20px 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .search-input {
    padding: 14px 45px 14px 16px;
    font-size: 15px;
  }
}
```

## Error Handling

### Input Validation

- Non-numeric characters are stripped from search query before filtering
- Empty or whitespace-only queries show all users
- No error states needed as search is always valid

### Edge Cases

1. **No users loaded**: Search input still displays but shows no results
2. **All users filtered out**: Display "no results" message
3. **Search during loading**: Search input remains functional, filters apply after data loads
4. **Special characters in phone numbers**: Stripped before comparison (e.g., "+84", "()", "-", spaces)

## Testing Strategy

### Manual Testing Checklist

1. **Basic Search**
   - Enter full phone number → Verify correct user appears
   - Enter partial phone number → Verify all matching users appear
   - Clear search → Verify all users reappear

2. **Edge Cases**
   - Enter non-numeric characters → Verify they're ignored
   - Enter spaces and special characters → Verify search still works
   - Search with no matches → Verify "no results" message appears

3. **User Actions**
   - Approve user from search results → Verify user moves to approved section
   - Reject user from search results → Verify user moves to rejected section
   - Perform action → Verify search query persists

4. **Tab Navigation**
   - Switch between "All Users" and "Pending Users" tabs → Verify search query persists
   - Search in one tab → Switch tabs → Verify search still applied

5. **Responsive Design**
   - Test on mobile viewport → Verify search input is full width
   - Test on tablet viewport → Verify layout remains functional
   - Test on desktop → Verify search input has max-width

6. **Performance**
   - Type rapidly in search input → Verify no lag or stuttering
   - Search with large user list (100+ users) → Verify filtering is instant

### Integration Testing

1. Load users from API → Apply search → Verify filtering works
2. Approve/reject user → Reload data → Verify search persists and re-applies
3. Multiple rapid searches → Verify state updates correctly

## Performance Considerations

### Optimization Strategies

1. **Client-side filtering**: No API calls needed, instant results
2. **Debouncing**: Not required as filtering is fast enough without it
3. **Memoization**: Not required for current user list sizes (typically < 1000 users)

### Scalability

For future optimization if user lists grow large (> 1000 users):
- Consider implementing debouncing with 300ms delay
- Consider server-side search endpoint
- Consider pagination with search

## Implementation Notes

### Minimal Changes Approach

- No new components created
- No API changes required
- No backend modifications needed
- Existing user management actions remain unchanged
- Existing styling patterns followed

### Accessibility

- Search input includes placeholder text in Vietnamese
- Clear button has hover states for visibility
- Focus states clearly indicate active input
- No keyboard traps or accessibility barriers

### Browser Compatibility

- Uses standard React hooks (useState)
- Uses standard JavaScript string methods
- CSS uses widely supported properties
- No polyfills required
