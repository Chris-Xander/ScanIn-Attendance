# Firebase Setup Guide

## Security Rules Setup

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init
```
- Select "Firestore" when prompted
- Choose your project: `attendance-app-3efdc`
- Accept the default rules file location

### 4. Deploy Security Rules
The security rules are already created in `firestore.rules`. To deploy them:

```bash
firebase deploy --only firestore:rules
```

### 5. Verify Rules Deployment
You can verify the rules are deployed by:
1. Going to the Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. You should see the deployed rules

## Security Rules Explanation

The rules provide the following security:

### Users Collection
- Users can only read/write their own user data
- Requires authentication

### Custom QR Codes Collection
- Anyone authenticated can read QR codes
- Only the admin who created the QR code can create/update/delete
- Prevents unauthorized modifications

### Attendance Records Collection
- Anyone authenticated can create attendance records
- Admins can read records for their QR codes
- Users can read their own records
- Only admins can update/delete records

### Scan Forms Collection
- Public read access for QR code validation
- Only authenticated users can write

## Testing the Rules

### Test QR Code Creation
1. Login as an admin
2. Try to create a custom QR code
3. Should work if authenticated

### Test Attendance Recording
1. Scan a QR code as a member
2. Submit attendance form
3. Should create a record in Firestore

### Test Unauthorized Access
1. Try to access other users' data
2. Should be denied

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check if user is authenticated
   - Verify the user ID matches the document owner
   - Ensure rules are properly deployed

2. **Network Errors**
   - Check internet connection
   - Verify Firebase project configuration
   - Check if Firebase services are enabled

3. **Authentication Issues**
   - Ensure user is logged in
   - Check if auth token is valid
   - Verify Firebase Auth is properly configured

### Debug Steps

1. **Check Firebase Console**
   - Go to Firestore Database
   - Check if collections exist
   - Verify data structure

2. **Check Browser Console**
   - Look for Firebase errors
   - Check authentication status
   - Verify network requests

3. **Test Rules Locally**
   ```bash
   firebase emulators:start
   ```
   - Test rules in local environment
   - Debug without affecting production

## Production Deployment

### Before Going Live
1. Test all functionality with the new rules
2. Verify admin and member access works correctly
3. Test QR code creation and scanning
4. Verify attendance recording works

### Monitoring
1. Check Firebase Console for errors
2. Monitor authentication usage
3. Track Firestore read/write operations
4. Set up alerts for unusual activity

## Security Best Practices

1. **Regular Rule Reviews**
   - Review rules monthly
   - Update based on new features
   - Test security thoroughly

2. **User Management**
   - Implement proper user roles
   - Regular security audits
   - Monitor suspicious activity

3. **Data Protection**
   - Encrypt sensitive data
   - Implement data retention policies
   - Regular backups

## Support

If you encounter issues:
1. Check Firebase documentation
2. Review error messages in console
3. Test with Firebase emulator
4. Contact Firebase support if needed 