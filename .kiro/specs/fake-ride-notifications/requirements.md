# Requirements Document

## Introduction

Hệ thống quản lý thông báo ảo cuốc xe (Fake Ride Notifications Management System) là một tính năng trong Web Admin Dashboard cho phép quản trị viên tạo và quản lý các template thông báo ảo về cuốc xe. Các template này sẽ được sử dụng để hiển thị thông báo giả mạo cho khách hàng nhằm tạo cảm giác "có nhiều tài xế và cuốc xe đang hoạt động".

Phạm vi tài liệu này CHỈ bao gồm phần Web Admin interface để quản lý templates. Phần Mobile App và việc hiển thị thông báo cho người dùng cuối sẽ được phát triển trong giai đoạn sau.

## Glossary

- **Admin_Dashboard**: Giao diện quản trị web hiện tại
- **Fake_Notifications_Tab**: Tab mới trong Admin Dashboard để quản lý thông báo ảo
- **Admin**: Quản trị viên hệ thống
- **Template**: Mẫu thông báo ảo được tạo bởi admin
- **Region**: Vùng miền (north = Miền Bắc, central = Miền Trung, south = Miền Nam)
- **Car_Type**: Loại xe (4 chỗ, 7 chỗ, 16 chỗ)
- **Database**: Cơ sở dữ liệu MongoDB lưu trữ thông tin
- **Backend_API**: API endpoints xử lý CRUD operations cho templates

## Requirements

### Requirement 1: Thêm tab mới vào Dashboard

**User Story:** Là một admin, tôi muốn có tab mới để quản lý thông báo ảo, để dễ dàng truy cập chức năng này từ Dashboard hiện tại.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL add a new navigation tab labeled "Quản lý thông báo ảo"
2. THE Admin_Dashboard SHALL display the new tab alongside existing tabs "Quản lý người dùng" and "Yêu cầu chờ cuốc"
3. WHEN an Admin clicks the new tab, THE Admin_Dashboard SHALL display the Fake_Notifications_Tab content
4. THE Admin_Dashboard SHALL maintain the current design style with gradient purple and glassmorphism effects

### Requirement 2: Tạo template thông báo ảo

**User Story:** Là một admin, tôi muốn tạo template thông báo ảo, để cấu hình các thông báo sẽ hiển thị cho khách hàng.

#### Acceptance Criteria

1. THE Fake_Notifications_Tab SHALL provide a form to create new Templates
2. THE Fake_Notifications_Tab SHALL provide a dropdown field for Region with options "Miền Bắc", "Miền Trung", "Miền Nam"
3. THE Fake_Notifications_Tab SHALL provide a text input field for start point
4. THE Fake_Notifications_Tab SHALL provide a text input field for end point
5. THE Fake_Notifications_Tab SHALL provide a time picker field for display time in format "HH:MM"
6. THE Fake_Notifications_Tab SHALL provide a dropdown field for Car_Type with options "4 chỗ", "7 chỗ", "16 chỗ"
7. THE Fake_Notifications_Tab SHALL provide a number input field for price in VND
8. THE Fake_Notifications_Tab SHALL provide a toggle field for isActive status with default value true
9. THE Fake_Notifications_Tab SHALL provide Save and Cancel buttons
10. WHEN an Admin clicks Save with valid data, THE Fake_Notifications_Tab SHALL call the Backend_API to create the Template
11. WHEN an Admin clicks Cancel, THE Fake_Notifications_Tab SHALL clear the form without saving

### Requirement 3: Hiển thị danh sách template

**User Story:** Là một admin, tôi muốn xem danh sách tất cả template thông báo ảo, để theo dõi và quản lý các thông báo đang có.

#### Acceptance Criteria

1. THE Fake_Notifications_Tab SHALL display all Templates in a list or card layout
2. THE Fake_Notifications_Tab SHALL group Templates by Region with sections "Miền Bắc", "Miền Trung", "Miền Nam"
3. THE Fake_Notifications_Tab SHALL display departure time for each Template
4. THE Fake_Notifications_Tab SHALL display route information as "Điểm đi → Điểm đến" for each Template
5. THE Fake_Notifications_Tab SHALL display Car_Type for each Template
6. THE Fake_Notifications_Tab SHALL display price formatted with thousand separators for each Template
7. THE Fake_Notifications_Tab SHALL display isActive status with a toggle button for each Template
8. THE Fake_Notifications_Tab SHALL provide Edit and Delete buttons for each Template

### Requirement 4: Sửa template

**User Story:** Là một admin, tôi muốn chỉnh sửa template thông báo ảo, để cập nhật thông tin khi cần thiết.

#### Acceptance Criteria

1. WHEN an Admin clicks the Edit button, THE Fake_Notifications_Tab SHALL display a form pre-filled with the Template data
2. THE Fake_Notifications_Tab SHALL allow Admin to modify all Template fields
3. THE Fake_Notifications_Tab SHALL provide Update and Cancel buttons
4. WHEN an Admin clicks Update with valid data, THE Fake_Notifications_Tab SHALL call the Backend_API to update the Template
5. WHEN an Admin clicks Cancel, THE Fake_Notifications_Tab SHALL close the form without saving changes

### Requirement 5: Xóa template

**User Story:** Là một admin, tôi muốn xóa template thông báo ảo không còn sử dụng, để giữ danh sách gọn gàng.

#### Acceptance Criteria

1. WHEN an Admin clicks the Delete button, THE Fake_Notifications_Tab SHALL display a confirmation dialog
2. THE confirmation dialog SHALL display the message "Bạn có chắc chắn muốn xóa template này?"
3. WHEN an Admin confirms deletion, THE Fake_Notifications_Tab SHALL call the Backend_API to delete the Template
4. WHEN an Admin cancels deletion, THE Fake_Notifications_Tab SHALL close the dialog without deleting

### Requirement 6: Bật/tắt template nhanh

**User Story:** Là một admin, tôi muốn bật/tắt template nhanh chóng, để kiểm soát thông báo nào đang hoạt động mà không cần xóa.

#### Acceptance Criteria

1. WHEN an Admin clicks the toggle button, THE Fake_Notifications_Tab SHALL call the Backend_API to toggle the isActive status
2. THE Fake_Notifications_Tab SHALL update the UI immediately to reflect the new status
3. THE Fake_Notifications_Tab SHALL not require page refresh after toggling
4. THE Fake_Notifications_Tab SHALL display visual feedback during the toggle operation

### Requirement 7: Form validation

**User Story:** Là một admin, tôi muốn form validation rõ ràng, để tránh nhập sai dữ liệu khi tạo/sửa template.

#### Acceptance Criteria

1. THE Fake_Notifications_Tab SHALL validate that Region is selected before saving
2. THE Fake_Notifications_Tab SHALL validate that start point is not empty before saving
3. THE Fake_Notifications_Tab SHALL validate that end point is not empty before saving
4. THE Fake_Notifications_Tab SHALL validate that display time is in valid format "HH:MM" before saving
5. THE Fake_Notifications_Tab SHALL validate that Car_Type is selected before saving
6. THE Fake_Notifications_Tab SHALL validate that price is a positive number before saving
7. WHEN validation fails, THE Fake_Notifications_Tab SHALL display error messages next to invalid fields
8. WHEN validation fails, THE Fake_Notifications_Tab SHALL prevent form submission

### Requirement 8: Responsive design

**User Story:** Là một admin, tôi muốn giao diện hoạt động tốt trên cả desktop và mobile, để quản lý thông báo từ bất kỳ thiết bị nào.

#### Acceptance Criteria

1. THE Fake_Notifications_Tab SHALL display properly on desktop screens with width greater than 1024 pixels
2. THE Fake_Notifications_Tab SHALL display properly on tablet screens with width between 768 and 1024 pixels
3. THE Fake_Notifications_Tab SHALL display properly on mobile screens with width less than 768 pixels
4. THE Fake_Notifications_Tab SHALL adapt card layout to single column on mobile screens
5. THE Fake_Notifications_Tab SHALL maintain readability and usability across all screen sizes

### Requirement 9: Loading states và notifications

**User Story:** Là một admin, tôi muốn thấy trạng thái loading và thông báo kết quả, để biết hệ thống đang xử lý và kết quả thao tác.

#### Acceptance Criteria

1. WHEN a create, update, delete, or toggle operation is in progress, THE Fake_Notifications_Tab SHALL display a loading indicator
2. WHEN an operation completes successfully, THE Fake_Notifications_Tab SHALL display a success notification
3. WHEN an operation fails, THE Fake_Notifications_Tab SHALL display an error notification with error message
4. THE Fake_Notifications_Tab SHALL auto-dismiss success notifications after 3 seconds
5. THE Fake_Notifications_Tab SHALL allow manual dismissal of error notifications

### Requirement 10: Cài đặt random (Optional)

**User Story:** Là một admin, tôi muốn cấu hình số lượng và tần suất thông báo, để điều chỉnh trải nghiệm người dùng trong tương lai.

#### Acceptance Criteria

1. THE Fake_Notifications_Tab SHALL provide an optional settings section
2. THE settings section SHALL allow Admin to set minimum notifications per hour with default value 3
3. THE settings section SHALL allow Admin to set maximum notifications per hour with default value 4
4. THE settings section SHALL allow Admin to set minimum random interval in minutes with default value 15
5. THE settings section SHALL allow Admin to set maximum random interval in minutes with default value 30
6. THE settings section SHALL validate that maximum values are greater than minimum values
7. WHEN settings are updated, THE Fake_Notifications_Tab SHALL call the Backend_API to save the settings

### Requirement 11: Database model cho Template

**User Story:** Là hệ thống, tôi cần lưu trữ template thông báo ảo, để có thể truy xuất và quản lý chúng.

#### Acceptance Criteria

1. THE Database SHALL store Templates with schema: region (String), startPoint (String), endPoint (String), displayTime (String), carType (String), price (Number), isActive (Boolean), createdBy (ObjectId), createdAt (Date), updatedAt (Date)
2. THE Database SHALL enforce region to be one of 'north', 'central', or 'south'
3. THE Database SHALL enforce carType to be one of '4', '7', or '16'
4. THE Database SHALL enforce price to be a positive number
5. THE Database SHALL set default value for isActive to true
6. THE Database SHALL automatically set createdAt to current timestamp on creation
7. THE Database SHALL automatically update updatedAt to current timestamp on modification

### Requirement 12: Database model cho Settings (Optional)

**User Story:** Là hệ thống, tôi cần lưu trữ cài đặt thông báo, để áp dụng cấu hình cho việc random thông báo trong tương lai.

#### Acceptance Criteria

1. THE Database SHALL store notification settings with schema: minNotificationsPerHour (Number), maxNotificationsPerHour (Number), randomIntervalMin (Number), randomIntervalMax (Number)
2. THE Database SHALL set default value for minNotificationsPerHour to 3
3. THE Database SHALL set default value for maxNotificationsPerHour to 4
4. THE Database SHALL set default value for randomIntervalMin to 15
5. THE Database SHALL set default value for randomIntervalMax to 30

### Requirement 13: API tạo template

**User Story:** Là một admin, tôi muốn API để tạo template thông báo ảo, để tích hợp với giao diện web admin.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a POST endpoint at /api/admin/fake-notifications
2. WHEN receiving a POST request, THE Backend_API SHALL validate Admin authentication token
3. WHEN receiving a POST request with valid data, THE Backend_API SHALL create a new Template in the Database
4. WHEN receiving a POST request with invalid data, THE Backend_API SHALL return an error response with status code 400
5. WHEN a Template is created successfully, THE Backend_API SHALL return the created Template with status code 201

### Requirement 14: API lấy danh sách template

**User Story:** Là một admin, tôi muốn API để lấy danh sách template, để hiển thị trong giao diện quản lý.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a GET endpoint at /api/admin/fake-notifications
2. WHEN receiving a GET request, THE Backend_API SHALL validate Admin authentication token
3. WHEN receiving a GET request, THE Backend_API SHALL return all Templates from the Database
4. THE Backend_API SHALL return Templates sorted by createdAt in descending order
5. THE Backend_API SHALL return Templates with status code 200

### Requirement 15: API cập nhật template

**User Story:** Là một admin, tôi muốn API để cập nhật template, để chỉnh sửa thông tin thông báo.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a PUT endpoint at /api/admin/fake-notifications/:id
2. WHEN receiving a PUT request, THE Backend_API SHALL validate Admin authentication token
3. WHEN receiving a PUT request with valid data, THE Backend_API SHALL update the Template in the Database
4. WHEN receiving a PUT request for a non-existent Template, THE Backend_API SHALL return an error response with status code 404
5. WHEN a Template is updated successfully, THE Backend_API SHALL return the updated Template with status code 200

### Requirement 16: API xóa template

**User Story:** Là một admin, tôi muốn API để xóa template, để loại bỏ thông báo không còn cần thiết.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a DELETE endpoint at /api/admin/fake-notifications/:id
2. WHEN receiving a DELETE request, THE Backend_API SHALL validate Admin authentication token
3. WHEN receiving a DELETE request, THE Backend_API SHALL remove the Template from the Database
4. WHEN receiving a DELETE request for a non-existent Template, THE Backend_API SHALL return an error response with status code 404
5. WHEN a Template is deleted successfully, THE Backend_API SHALL return a success message with status code 200

### Requirement 17: API bật/tắt template

**User Story:** Là một admin, tôi muốn API để bật/tắt template nhanh, để kiểm soát thông báo hiển thị.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a PATCH endpoint at /api/admin/fake-notifications/:id/toggle
2. WHEN receiving a PATCH request, THE Backend_API SHALL validate Admin authentication token
3. WHEN receiving a PATCH request, THE Backend_API SHALL toggle the isActive value of the Template
4. WHEN receiving a PATCH request for a non-existent Template, THE Backend_API SHALL return an error response with status code 404
5. WHEN a Template is toggled successfully, THE Backend_API SHALL return the updated Template with status code 200

### Requirement 18: API lấy và cập nhật settings (Optional)

**User Story:** Là một admin, tôi muốn API để quản lý cài đặt thông báo, để điều chỉnh cấu hình hệ thống trong tương lai.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a GET endpoint at /api/admin/fake-notifications/settings
2. THE Backend_API SHALL provide a PUT endpoint at /api/admin/fake-notifications/settings
3. WHEN receiving a GET request, THE Backend_API SHALL validate Admin authentication token and return current notification settings
4. WHEN receiving a PUT request, THE Backend_API SHALL validate Admin authentication token and update notification settings
5. WHEN receiving a PUT request with invalid values, THE Backend_API SHALL return an error response with status code 400

### Requirement 19: Phân quyền admin

**User Story:** Là hệ thống, tôi cần đảm bảo chỉ admin mới có quyền quản lý thông báo ảo, để bảo mật dữ liệu.

#### Acceptance Criteria

1. WHEN receiving a request to admin endpoints, THE Backend_API SHALL verify the request contains a valid Admin authentication token
2. IF the authentication token is invalid or missing, THEN THE Backend_API SHALL return an error response with status code 401
3. IF the authenticated user is not an Admin, THEN THE Backend_API SHALL return an error response with status code 403
4. THE Backend_API SHALL use the existing admin authentication middleware from the current system
