# ScanIn (Attendid) - Full Project Documentation

## Overview

**ScanIn** (also known as **Attendid**) is a comprehensive Progressive Web App (PWA) for modern attendance tracking. It provides a complete solution for organizations, schools, and events to manage attendance through QR code scanning, form-based submissions, and real-time analytics.

### Key Features
- **Custom QR Code Management**: Create unlimited custom QR codes for different events
- **Form-Based Attendance**: Configure QR codes to require detailed information submission
- **Role-Based Access Control**: Separate admin and member interfaces
- **Real-Time Analytics**: Live attendance statistics and reporting
- **Progressive Web App**: Installable on any device with offline capabilities
- **Firebase Integration**: Secure authentication and data storage

## Project Structure

### Technology Stack

#### Frontend
- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Material-UI**: Component library for consistent UI
- **React Router DOM**: Client-side routing
- **HTML5-QRCode**: QR code scanning functionality
- **React-QR-Code**: QR code generation
- **XLSX**: Excel file generation for reports

#### Backend & Services
- **Firebase**:
  - Authentication (Firebase Auth)
  - Firestore (NoSQL database)
  - Firebase Storage (file storage)
- **Express Server**: LAN-only attendance submission endpoint
- **Firebase Admin SDK**: Server-side Firebase operations

#### Development Tools
- **ESLint**: Code linting
- **Vite Plugins**: React and other development plugins
- **GH-Pages**: GitHub Pages deployment

### Directory Structure

```
ScanIn/
├── ScanIn/ (Main project directory)
│   ├── public/ (Static assets)
│   │   ├── 404.html
│   │   └── vite.svg
│   ├── src/ (Source code)
│   │   ├── assets/ (Images, icons, illustrations)
│   │   │   ├── Icons/ (UI icons)
│   │   │   └── illustrations/ (Hero images)
│   │   ├── components/ (Reusable React components)
│   │   │   ├── Admin*.jsx (Admin interface components)
│   │   │   ├── Member*.jsx (Member interface components)
│   │   │   ├── ProtectedRoute.jsx (Route protection)
│   │   │   ├── ResponsiveNavbar.jsx (Navigation)
│   │   │   └── QRCode*.js/jsx (QR functionality)
│   │   ├── contexts/ (React contexts)
│   │   │   └── AuthContext.jsx (Authentication state)
│   │   ├── firebase/ (Firebase configuration)
│   │   │   └── config.jsx (Firebase setup)
│   │   ├── pages/ (Page components)
│   │   │   ├── Admin.jsx (Admin dashboard)
│   │   │   ├── Landing.jsx (Landing page)
│   │   │   ├── Login.jsx (Authentication)
│   │   │   ├── Member.jsx (Member dashboard)
│   │   │   ├── PublicScan.jsx (Public QR scanning)
│   │   │   └── ScanForm.jsx (Form submission)
│   │   ├── services/ (Business logic services)
│   │   │   └── mockService.js (Mock data for development)
│   │   ├── utility/ (Utility functions)
│   │   │   └── deviceFingerprint.jsx (Device identification)
│   │   └── page_styles/ (CSS stylesheets)
│   ├── server/ (Backend server)
│   │   ├── index.js (Express server)
│   │   ├── package.json (Server dependencies)
│   │   └── serviceAccountKey.json (Firebase admin credentials)
│   ├── dist/ (Build output)
│   ├── node_modules/ (Dependencies)
│   ├── package.json (Project dependencies)
│   ├── vite.config.js (Vite configuration)
│   ├── firebase.json (Firebase hosting config)
│   ├── firestore.rules (Database security rules)
│   ├── storage.rules (Storage security rules)
│   ├── README.md (Project overview)
│   ├── FIREBASE_SETUP.md (Firebase setup guide)
│   ├── USER_DISPLAY_GUIDE.md (User interface guide)
│   ├── DOCUMENTATION_FOR_LOVABLE_AI.md (AI documentation)
│   └── FULL_PROJECT_DOCUMENTATION.md (This file)
```

## Core Components

### App.jsx (Main Application)

**Location**: `src/App.jsx`

**Purpose**: Main application component that sets up routing, theming, and authentication context.

**Key Features**:
- Material-UI theme provider
- Authentication context wrapper
- React Router setup with protected routes
- Role-based route protection (admin/member)

**Routes**:
- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/scan` - Public QR code scanning
- `/scan-form/:qrId` - Form-based attendance submission
- `/member` - Member dashboard (protected)
- `/admin` - Admin dashboard (protected)

### Authentication System

#### AuthContext.jsx

**Location**: `src/contexts/AuthContext.jsx`

**Purpose**: Manages authentication state and user data across the application.

**Key Functions**:
- `signup(email, password, name, role)` - User registration
- `login(email, password)` - User authentication
- `logout()` - Sign out
- `updateUserProfile(updates)` - Update user profile
- `updateUserData(updates)` - Update Firestore user data
- `getUserData()` - Retrieve user data from Firestore
- `getUserDisplayName()` - Get display name
- `getUserRole()` - Get user role (admin/member)

**State Management**:
- `currentUser` - Current authenticated user
- `loading` - Authentication loading state
- `useMock` - Mock service toggle for development

#### ProtectedRoute.jsx

**Location**: `src/components/ProtectedRoute.jsx`

**Purpose**: Protects routes based on authentication and user roles.

**Props**:
- `children` - Protected component
- `requiredRole` - Required user role (admin/member)

### Admin Interface

#### Admin.jsx (Main Admin Page)

**Location**: `src/pages/Admin.jsx`

**Purpose**: Main admin dashboard with navigation between different admin sections.

**Sections**:
- Dashboard - Overview and analytics
- QR Codes - QR code management
- User Control - User management
- Gate Report - Attendance reports

**Features**:
- Responsive navigation
- Mobile menu support
- Section-based content rendering

#### AdminQRCodes.jsx

**Location**: `src/components/AdminQRCodes.jsx`

**Purpose**: Complete QR code creation, management, and viewing interface.

**Key Features**:
- Create custom QR codes with forms
- Configure form fields dynamically
- Set validity periods
- View QR codes with generated URLs
- Toggle active/inactive status
- Delete QR codes

**Form Fields**:
- Name (required)
- Description
- Location
- Event Type (meeting/conference/workshop/training/other)
- Valid From/Until dates
- Form requirements toggle
- Dynamic form fields (name, email, phone, etc.)
- Active status

**Data Structure**:
```javascript
{
  qrId: "unique_identifier",
  name: "Event Name",
  description: "Event Description",
  location: "Event Location",
  eventType: "meeting|conference|workshop|training|other",
  validFrom: "2024-01-01T00:00:00Z",
  validUntil: "2024-12-31T23:59:59Z",
  requiresForm: true,
  formFields: ["name", "email", "phone"],
  adminId: "admin_user_id",
  isActive: true,
  scanCount: 0,
  createdAt: "timestamp"
}
```

#### AdminReports.jsx

**Location**: `src/components/AdminReports.jsx`

**Purpose**: View and manage QR code reports, download attendance data.

**Key Features**:
- List all QR gate reports
- Download responses as Excel files
- Toggle QR code active status
- Delete reports
- View report details (scans, form fields, etc.)

**Collections Used**:
- `qrGateReports` - Report metadata
- `formSubmitData` - Form submission data

### Member Interface

#### Member.jsx (Main Member Page)

**Location**: `src/pages/Member.jsx`

**Purpose**: Main member dashboard with navigation between member functions.

**Sections**:
- Clock-in/Clock-out - QR scanning
- History - Attendance history
- Details - Personal information
- Settings - Account settings

#### MemberClockin.jsx

**Location**: `src/components/MemberClockin.jsx`

**Purpose**: QR code scanning interface for members.

**Features**:
- Camera access for QR scanning
- Real-time QR code detection
- Automatic form redirection
- Attendance submission

### Public Interface

#### PublicScan.jsx

**Location**: `src/pages/PublicScan.jsx`

**Purpose**: Public QR code scanning without authentication.

**Features**:
- Anonymous QR scanning
- Direct form access
- No registration required

#### ScanForm.jsx

**Location**: `src/pages/ScanForm.jsx`

**Purpose**: Dynamic form generation and submission based on QR code configuration.

**Features**:
- Dynamic field rendering
- Form validation
- Firebase submission
- Success/error handling

### Utility Components

#### ResponsiveNavbar.jsx

**Location**: `src/components/ResponsiveNavbar.jsx`

**Purpose**: Responsive navigation component used across admin and member interfaces.

**Features**:
- Mobile hamburger menu
- Active section highlighting
- User display
- Logout functionality

#### QRCodeScanner.js

**Location**: `src/components/QRCodeScanner.js`

**Purpose**: QR code scanning functionality using HTML5-QRCode library.

**Features**:
- Camera initialization
- QR code detection
- Error handling
- Success callbacks

## Backend Services

### Express Server

**Location**: `server/index.js`

**Purpose**: LAN-only attendance submission server for offline/local network use.

**Features**:
- Express.js server
- CORS configuration
- IP-based access control (LAN only)
- Firebase Admin SDK integration
- Attendance data submission endpoint

**Endpoints**:
- `POST /api/attendance` - Submit attendance data

**Security**:
- LAN-only access (192.168.x.x or ::1)
- Firebase Admin authentication

### Firebase Configuration

#### Firebase Config

**Location**: `src/firebase/config.jsx`

**Services**:
- Firebase Auth
- Firestore
- Firebase Storage

**Configuration**:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "attendance-app-3efdc.firebaseapp.com",
  projectId: "attendance-app-3efdc",
  storageBucket: "attendance-app-3efdc.firebasestorage.app",
  messagingSenderId: "497796473137",
  appId: "1:497796473137:web:f0e099936c2da1a1a99010",
  measurementId: "G-7Z9R9H9QBW"
};
```

#### Firestore Security Rules

**Location**: `firestore.rules`

**Key Rules**:
- Users can read/write their own data
- Admins can manage QR codes and reports
- Attendance records are protected
- Form submissions require authentication

**Sample Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admins can manage QR codes
    match /customQRCodes/{qrId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.adminId;
    }

    // Attendance records
    match /attendanceRecords/{recordId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Data Models

### Firestore Collections

#### users
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  role: "admin|member",
  createdAt: timestamp,
  phone: "",
  profilePhotoURL: ""
}
```

#### customQRCodes
```javascript
{
  qrId: "qr_1234567890_abc123",
  name: "Event Name",
  description: "Event Description",
  location: "Conference Room A",
  eventType: "meeting",
  validFrom: "2024-01-01T00:00:00Z",
  validUntil: "2024-12-31T23:59:59Z",
  requiresForm: true,
  formFields: ["name", "email", "phone"],
  adminId: "admin_uid",
  isActive: true,
  scanCount: 0,
  createdAt: "2024-01-01T00:00:00Z"
}
```

#### qrGateReports
```javascript
{
  qrCodeId: "qr_1234567890_abc123",
  qrCodeDocId: "firestore_doc_id",
  name: "Event Name",
  description: "Event Description",
  location: "Conference Room A",
  eventType: "meeting",
  validFrom: "2024-01-01T00:00:00Z",
  validUntil: "2024-12-31T23:59:59Z",
  requiresForm: true,
  formFields: ["name", "email", "phone"],
  isActive: true,
  adminId: "admin_uid",
  createdAt: "2024-01-01T00:00:00Z",
  scanCount: 0,
  totalScans: 0,
  lastScanAt: null
}
```

#### formSubmitData
```javascript
{
  qrCodeId: "qr_1234567890_abc123",
  adminId: "admin_uid",
  memberId: "member_uid",
  timestamp: "2024-01-01T12:00:00Z",
  formData: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    reason: "Meeting attendance"
  }
}
```

#### attendanceRecords
```javascript
{
  qrCodeId: "qr_1234567890_abc123",
  qrCodeName: "Event Name",
  adminId: "admin_uid",
  timestamp: "2024-01-01T12:00:00Z",
  status: "clock-in",
  formData: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    reason: "Meeting attendance"
  },
  location: "Conference Room A",
  eventType: "meeting"
}
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Firebase Admin SDK credentials

### Frontend Setup
```bash
cd ScanIn
npm install
npm run dev
```

### Backend Server Setup
```bash
cd server
npm install
npm start
```

### Firebase Setup
1. Create Firebase project
2. Enable Authentication and Firestore
3. Update configuration in `src/firebase/config.jsx`
4. Deploy security rules
5. Add service account key to `server/serviceAccountKey.json`

### Build & Deployment
```bash
npm run build
npm run deploy
```

## API Reference

### Frontend APIs

#### Authentication
- `signup(email, password, name, role)` - Register new user
- `login(email, password)` - Authenticate user
- `logout()` - Sign out user
- `getUserRole()` - Get current user role

#### QR Code Management
- `createQRCode(data)` - Create new QR code
- `getQRCodes(adminId)` - Get admin's QR codes
- `updateQRCode(id, data)` - Update QR code
- `deleteQRCode(id)` - Delete QR code

#### Reports
- `getReports(adminId)` - Get admin reports
- `downloadReport(qrCodeId)` - Download Excel report
- `deleteReport(id)` - Delete report

### Backend APIs

#### Express Server
- `POST /api/attendance` - Submit attendance data

**Request Body**:
```json
{
  "qrCodeId": "qr_123",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Security Considerations

### Authentication
- Firebase Authentication for user management
- Role-based access control (admin/member)
- Protected routes with authentication checks

### Data Security
- Firestore security rules
- User data isolation
- Admin-only operations

### Network Security
- HTTPS required for production
- CORS configuration
- LAN-only server access

## Development Guidelines

### Code Style
- ESLint configuration
- React functional components with hooks
- Consistent naming conventions
- Component-based architecture

### State Management
- React Context for global state
- Local component state for UI state
- Firebase real-time listeners

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Loading states for better UX

## Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] QR code creation and management
- [ ] Form submission and validation
- [ ] Report generation and download
- [ ] Mobile responsiveness
- [ ] PWA installation

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

#### Firebase Connection
- Check Firebase configuration
- Verify API keys
- Check Firestore security rules

#### QR Code Scanning
- Camera permissions
- HTTPS requirement for camera access
- Mobile browser compatibility

#### Build Issues
- Clear node_modules and reinstall
- Check Node.js version
- Verify environment variables

## Future Enhancements

### Planned Features
- [ ] Advanced analytics dashboard
- [ ] Bulk QR code operations
- [ ] Integration with calendar systems
- [ ] Push notifications
- [ ] Advanced user management
- [ ] API rate limiting
- [ ] Data export improvements

### Technical Improvements
- [ ] Unit testing framework
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Offline data synchronization
- [ ] Multi-language support

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Tests pass
- [ ] Documentation updated

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check existing documentation
- Review Firebase setup guide
- Open GitHub issues
- Contact development team

---

**ScanIn (Attendid)** - Making attendance tracking effortless and efficient! 🎯
