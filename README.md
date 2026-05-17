# Attendid - Advanced Attendance Tracking System

A comprehensive Progressive Web App (PWA) for modern attendance tracking with custom QR code management, form-based attendance, and real-time analytics.

## 🚀 Features

### **Custom QR Code Management**
- **Multiple QR Codes**: Create unlimited custom QR codes for different events, locations, and purposes
- **Form-Based Attendance**: Configure QR codes to require detailed information submission
- **Flexible Form Fields**: Choose from name, email, phone, company, department, and reason fields
- **Validity Periods**: Set start and end dates for QR code validity
- **Event Types**: Categorize QR codes as meetings, events, classes, workshops, training, or general attendance
- **Location Tracking**: Assign specific locations to each QR code
- **Active/Inactive Status**: Enable or disable QR codes as needed

### **Enhanced Admin Dashboard**
- **QR Code Management**: Create, view, edit, and delete custom QR codes
- **Real-Time Analytics**: View scan counts, attendance records, and user activity
- **Detailed Reports**: Export attendance data with form submissions
- **User Management**: Control user access and permissions
- **Settings Management**: Configure account preferences and notifications

### **Smart Member Interface**
- **Universal QR Scanner**: Works with both legacy and custom QR codes
- **Automatic Form Navigation**: Seamlessly redirects to appropriate forms
- **Attendance History**: View personal attendance records
- **Profile Management**: Update personal information and preferences

### **Public Access**
- **No Registration Required**: Anyone can scan QR codes without creating an account
- **Form-Based Attendance**: Submit attendance information through custom forms
- **Mobile Optimized**: Works perfectly on all devices

## 🛠 Technology Stack

- **Frontend**: React 19 with Vite
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **QR Code**: `react-qr-code` and `html5-qrcode`
- **UI**: Material-UI components
- **Export**: XLSX for Excel exports
- **PWA**: Progressive Web App capabilities

## 📱 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Follow the setup instructions in `FIREBASE_SETUP.md`
   - Update Firebase configuration in `src/firebase/config.jsx`

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Usage

### **For Administrators**

1. **Create Custom QR Codes**
   - Navigate to "QR Codes" section in admin dashboard
   - Click "Create New QR Code"
   - Fill in details: name, description, location, event type
   - Configure form fields and validity periods
   - Generate and download QR codes

2. **Manage Attendance**
   - View real-time attendance records
   - Export data to Excel
   - Monitor scan statistics
   - Manage user access

3. **Generate Reports**
   - Access detailed analytics
   - View attendance trends
   - Export comprehensive reports

### **For Members**

1. **Scan QR Codes**
   - Use the member interface to scan any QR code
   - Automatically redirects to appropriate forms
   - Submit attendance information
   - View personal attendance history

2. **Track Attendance**
   - View personal attendance records
   - Access attendance history
   - Update profile information

### **For Public Users**

1. **Scan Without Registration**
   - Access `/scan` to scan QR codes without login
   - Submit attendance information through forms
   - No account creation required

## 📊 Data Structure

### **Custom QR Codes Collection**
```javascript
{
  qrId: "unique_identifier",
  name: "Event Name",
  description: "Event Description",
  location: "Event Location",
  eventType: "meeting|event|class|workshop|training|general",
  validFrom: "2024-01-01T00:00:00Z",
  validUntil: "2024-12-31T23:59:59Z",
  requiresForm: true,
  formFields: ["name", "email", "phone", "reason"],
  adminId: "admin_user_id",
  isActive: true,
  scanCount: 0,
  createdAt: "timestamp"
}
```

### **Attendance Records Collection**
```javascript
{
  qrCodeId: "qr_code_identifier",
  qrCodeName: "Event Name",
  adminId: "admin_user_id",
  timestamp: "timestamp",
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

## 🔐 Security Features

- **Role-Based Access Control**: Admin and member roles with different permissions
- **Protected Routes**: Secure access to admin and member areas
- **QR Code Validation**: Check validity dates and active status
- **Form Validation**: Required field validation and data sanitization
- **Firebase Security**: Built-in Firebase security rules

## 📈 Analytics & Reporting

- **Real-Time Dashboard**: Live attendance statistics
- **Custom QR Code Analytics**: Track scan counts and usage
- **Export Capabilities**: Excel export with detailed data
- **User Activity Tracking**: Monitor user engagement
- **Attendance Trends**: Analyze attendance patterns

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Deploy to Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔄 Recent Updates

### **v2.0 - Custom QR Code System**
- ✅ Multiple custom QR codes per admin
- ✅ Form-based attendance submission
- ✅ Configurable form fields
- ✅ QR code validity periods
- ✅ Enhanced admin dashboard
- ✅ Improved attendance tracking
- ✅ Better data structure
- ✅ Real-time analytics

### **v1.0 - Basic Attendance System**
- ✅ User authentication
- ✅ Basic QR code scanning
- ✅ Simple attendance tracking
- ✅ Admin/member roles
- ✅ Firebase integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in `FIREBASE_SETUP.md`
- Review the code comments
- Open an issue on GitHub

---


**Attendid** - Making attendance tracking effortless and efficient! 🎯
