# LAN Attendance Node Server

1. Place your Firebase service account key as `serviceAccountKey.json` in this folder.
   - Download it from Firebase Console > Project Settings > Service Accounts.

2. Install dependencies:
   - Open PowerShell in this folder and run:
     npm install

3. Start the server:
   - npm start

4. The server will run on port 4000 and only accept attendance submissions from LAN IPs.

5. Update your React app to POST attendance to `http://localhost:4000/api/attendance` when in LAN mode.

6. Edit `index.js` to set your actual Firebase project databaseURL.
