# FixMyCity — Geo-Based Smart Civic Complaint Management System

## Project Overview

FixMyCity is a web-based civic complaint management system designed to help citizens report local infrastructure and public service issues and track their resolution.

The platform connects citizens, municipal officers, department staff, and administrators through a centralized complaint management interface.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- LocalStorage
- JSON (Mock Data)

## User Roles

1. **Citizen:** Register complaints, upload photographs, view submitted complaints, and track complaint status.
2. **Municipal Officer:** Review complaints, assign them to department staff, and manage complaint assignments.
3. **Department Staff:** View assigned complaints, add inspection notes, update complaint status, and submit resolution details and completion photographs.
4. **Administrator:** Monitor users and complaints, manage departments, and view system statistics.

## Key Features

- User registration and login with role-based dashboards.
- Civic complaint submission with category, description, location, latitude, longitude, and photograph.
- Unique complaint reference numbers.
- Complaint assignment to departments and staff.
- Complaint status tracking and history timeline.
- Inspection notes and resolution details.
- Complaint and completion photograph previews.
- Department management with add, edit, and delete operations.
- Dashboard statistics and complaint monitoring.
- Responsive interface using custom CSS and Bootstrap 5.

## Project Structure

```text
FIX-MY-CITY/
├── CSS/
│   └── style.css
├── JS/
│   ├── admin-dashboard.js
│   ├── auth.js
│   ├── complaints.js
│   ├── dashboard.js
│   ├── mock-data.js
│   ├── my-complaints.js
│   ├── officer-dashboard.js
│   ├── script.js
│   ├── staff-dashboard.js
│   ├── status-history.js
│   └── track.js
├── Pages/
│   ├── add-complaint.html
│   ├── admin-dashboard.html
│   ├── citizen-dashboard.html
│   ├── login.html
│   ├── my-complaints.html
│   ├── officer-dashboard.html
│   ├── register.html
│   ├── staff-dashboard.html
│   └── track-complaint.html
├── index.html
├── mock-data.json
└── README.md
```

## How to Run the Project

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Install the Live Server extension if it is not already installed.
4. Open `index.html`.
5. Right-click and select **Open with Live Server**.
6. Register an account and explore the available role-based dashboards.

## Current Implementation

This version is a frontend prototype. It uses browser LocalStorage for user sessions, registered users, complaints, assignments, department information, and status history. The `mock-data.json` file provides sample complaint records.

No backend server or production database is currently integrated.

## Future Enhancements

- Backend API integration.
- Secure authentication and role-based authorization.
- Database integration for persistent storage.
- Server-side image upload and storage.
- Map integration for geographic complaint visualization.
- Email or SMS notifications.
- Deployment to a production hosting environment.

## Project Status

Frontend implementation and end-to-end workflow testing completed. Backend integration is planned as the next development phase.

---

**Repository:** [FixMyCity](https://github.com/Rimsha1205/FixMyCity)</WritingBlock
