# Implementation Plan

- [x] 1. Add search state management to Dashboard component


  - Add `searchQuery` state variable using useState hook
  - Initialize with empty string
  - _Requirements: 1.1, 1.3_



- [ ] 2. Implement phone number filter logic
  - [ ] 2.1 Create filterUsersByPhone function
    - Write function that accepts User array and returns filtered array
    - Extract numeric characters from search query using regex
    - Filter users by matching phone numbers containing the numeric query


    - Return all users when search query is empty
    - _Requirements: 1.2, 2.1, 2.2, 2.3_
  
  - [ ] 2.2 Apply filter to user lists
    - Create filteredPendingUsers by applying filter to pendingUsers


    - Create filteredApprovedUsers by applying filter to approvedUsers
    - Create filteredRejectedUsers by applying filter to rejectedUsers
    - _Requirements: 1.2, 4.1_

- [x] 3. Add search input UI to Dashboard

  - [ ] 3.1 Create search container markup
    - Add search-container div above user list sections in users-section
    - Add text input with placeholder "Tìm kiếm theo số điện thoại..."
    - Bind input value to searchQuery state

    - Add onChange handler to update searchQuery state
    - _Requirements: 1.1, 1.5_
  
  - [ ] 3.2 Add clear button functionality
    - Add conditional clear button that shows when searchQuery is not empty
    - Add onClick handler to reset searchQuery to empty string
    - _Requirements: 3.1, 3.2_

- [x] 4. Add empty state for no search results

  - Add conditional rendering for "no results" message
  - Display message when filtered list is empty and searchQuery is not empty
  - Show message in Vietnamese: "Không tìm thấy người dùng với số điện thoại..."
  - _Requirements: 1.4_

- [x] 5. Update user list rendering to use filtered data


  - Replace pendingUsers with filteredPendingUsers in map function
  - Replace approvedUsers with filteredApprovedUsers in map function
  - Replace rejectedUsers with filteredRejectedUsers in map function
  - Ensure section headers show filtered counts
  - _Requirements: 1.2, 4.2_

- [x] 6. Add CSS styles for search components


  - [x] 6.1 Style search container and input


    - Add .search-container styles with positioning and spacing
    - Add .search-input styles with padding, border, and transitions
    - Add focus state styles for search input
    - _Requirements: 1.1, 2.4_
  
  - [x] 6.2 Style clear button


    - Add .clear-search-btn styles with absolute positioning
    - Add hover state styles for clear button
    - _Requirements: 3.1_
  
  - [x] 6.3 Style no results message


    - Add .no-results styles with centered text and background
    - _Requirements: 1.4_
  
  - [x] 6.4 Add mobile responsive styles


    - Add media query for max-width 768px
    - Adjust search container to full width on mobile
    - Adjust input padding and font size for mobile
    - _Requirements: 1.1_

- [ ] 7. Verify search persists across user actions
  - Test that searchQuery state remains after approve/reject actions
  - Verify filtered list updates correctly after user status changes
  - Ensure search continues to work after data reload
  - _Requirements: 4.2, 4.3, 4.4_
