Project: AttendID (Clockin-PWA)
Purpose: Rebuild the web app UI (member and admin interfaces) using Lovable AI — this document provides a detailed reference the AI can ingest to recreate components, pages, styles, routes and data connections.

---
1) High-level summary
- Single-page React app (Vite) for QR-based attendance clock-in/out.
- Auth: Firebase Authentication (email/password). Uses Firestore for app data and Firebase Storage for profile photos.
- Primary users: Admin (create QR codes, configure forms) and Member (scan QR codes, view history/profile/settings).
- Goals for rebuild: recreate visual interface, structure, responsive behavior, per-component styling, and Firebase integrations (auth, Firestore, storage).

2) Tech stack and constraints
- React (JSX) components
- CSS files imported in JS (currently plain CSS per-component). Keep this or convert to CSS Modules — prefer keeping component-level CSS to match existing app.
- Firebase: auth, firestore, storage (already configured in src/firebase/config.jsx)
- Router: react-router-dom (client-side routes)
- Dev/build: Vite (vite.config.js) — run with npm/yarn as in package.json

3) Repo entry points & important files (paths relative to AttendID/)
- src/main.jsx - app bootstrapping
- src/App.jsx or top-level pages (if present)
- src/pages/* - page-level components (Member.jsx, Admin.jsx, Login.jsx, Signup.jsx, ScanForm.jsx, PublicScan.jsx)
- src/components/* - reusable UI components
  - MemberClockin.jsx, MemberHistory.jsx, MemberDetails.jsx, MemberSettings.jsx
  - AdminDashboard.jsx, AdminQRCodes.jsx, AdminReports.jsx, AdminUsers.jsx
  - ResponsiveNavbar.jsx, UserDisplay.jsx
- src/contexts/AuthContext.jsx - authentication wrapper and helpers
- src/firebase/config.jsx - Firebase initialization (auth, db, storage)
- src/page_styles/* - page- and component-level CSS files
- public/ - static assets (images, icons)

4) Pages and routes (what the UI must render)
- Landing (/) - marketing/landing (simple)
- /login - login form, link to signup
- /signup - signup form (name, email, password, role)
- /member - member area (Member.jsx) - includes responsive navbar and main content:
  - /member (clock-in default) - MemberClockin: QR scanner, start/stop scanning, scan result, navigate to custom scan form
  - /member/history - MemberHistory: list of scan/attendance records
  - /member/details - MemberDetails: profile photo, name, email, phone, password actions (this needs to show and allow editing phone and uploading profile photo)
  - /member/settings - MemberSettings: preferences, notifications, privacy
- /admin - admin dashboard (Admin.jsx) - create and manage QR codes, users, reports
- /scan-form/:qrId - public/custom scan form (rendered when custom QR links are scanned)

5) Key components, responsibilities, props & selectors (component contract)
- MemberClockin
  - Props: currentUser
  - Behavior: render title/desc, show QR icon, Start Scanning button. When scanning, show QR reader container (id='reader') and call Html5QrcodeScanner. On successful scan: either navigate to /scan-form/:qrId or (legacy) write attendance record into Firestore.
  - CSS classes: member-container, member-title, member-desc, qr-code-icon, qr-reader-box, scan-btn, scan-result

- MemberHistory
  - Props: currentUser
  - Behavior: subscribe to Firestore collection scanHistory (filter userId currentUser.uid) and render chronological items.
  - CSS classes: member-container-history, member-title, member-desc, history-list, history-item

- MemberDetails
  - Props: currentUser
  - Behavior: show profile photo (photoURL), fallback to initial placeholder, allow uploading photo (uses Firebase Storage -> updateUserProfile), show name, email, phone (stored in Firestore users/{uid}), allow editing phone and saving to Firestore, password change button (needs separate modal or flow).
  - CSS classes: member-container, profile-details-card, profile-photo-section, profile-photo, profile-photo-img, profile-photo-placeholder, profile-info-section, profile-details-row, detail-label, detail-value, phone-input, save-btn, edit-btn

- MemberSettings
  - Props: currentUser, setActiveSection (optional)
  - Behavior: form for notification preferences, privacy, theme, language, save to user profile or Firestore.

- ResponsiveNavbar
  - Props: activeSection, onNavClick, logoText, navItems, userDisplay, logoutLink
  - Behavior: render nav items, highlight active, collapse to hamburger on small screens. CSS file: ResponsiveNavbar.css

- AdminQRCodes / QRCodeCreator
  - Behavior: create custom QR codes with fields configuration (which fields are required), store in customQRCodes collection, generate QR blobs/urls.

6) Data model (Firestore) - canonical collections and documents
- users/{uid} - profile info: { phone: string, extraFields... }
- customQRCodes/{id} - { qrId, adminId, fields: [{ name, required, label }], createdAt }
- scanHistory (or attendanceRecords) - { userId, memberId, adminId, result, timestamp, status }
- other app data: reports, logs

7) Authentication behaviors
- Signup uses createUserWithEmailAndPassword and updateProfile to set displayName (and earlier the code stores role in photoURL — this is a quirk; prefer storing role in Firestore users doc). After signup, send email verification via sendEmailVerification and block protected routes until user.emailVerified === true.
- AuthContext provides: signup, login, logout, updateUserProfile, getUserDisplayName, getUserRole

8) Firebase integrations (what UI needs to call)
- getDocs / onSnapshot to fetch lists (customQRCodes, scanHistory)
- addDoc / setDoc to write attendance records, custom QRs, user phone
- uploadBytes + getDownloadURL to upload profile photos and set photoURL in auth via updateProfile

9) CSS & styling rules
- Current approach: per-component CSS files under src/page_styles/ (Member.css split into component files)
- Namespacing convention: member pages use `.member-bg` wrapper to avoid global overrides
- Design tokens (CSS variables) used at `.member-bg` level: --m-accent, --m-accent-2, --m-panel, --m-radius-lg, --m-muted, --m-shadow-soft, etc.
- Responsive breakpoints: 980px, 780px, 640px, 450px, 380px

10) Accessibility / UX rules for rebuild
- Buttons must be reachable by keyboard and have visible focus states
- Use semantic elements (header, main, section)
- Images must have alt text
- Forms must have labels

11) Security & rules (high level)
- Firestore rules should restrict writes/reads to authenticated users and optionally require request.auth.token.email_verified == true for sensitive collections.
- Example rule: allow read/write on attendanceRecords only to authenticated & email_verified users.

12) Build & run (dev workflow)
- Install deps: npm install
- Dev: npm run dev (uses Vite)
- Build: npm run build
- Serve build: npm run preview or host via your chosen static host

13) Suggested actionable checklist for Lovable AI to rebuild interface
- Step A: Recreate global layout & routing
  - Generate `src/main.jsx`, router with routes matching the list in section (4)
  - Implement `ResponsiveNavbar` and page wrappers including `.member-bg` wrapper and CSS variables

- Step B: For each page, create a page component that imports the existing per-component CSS and composes the child components. Keep class names identical so existing logic and components can be wired in later.

- Step C: For each UI component (MemberClockin, MemberHistory, MemberDetails, MemberSettings, AdminQRCodes, QRCodeCreator, ResponsiveNavbar, UserDisplay), generate React components with props and behaviors listed in section (5), mock data for offline dev, and the CSS stubs from src/page_styles/*.

- Step D: Wire Firebase calls as stubs (so UI works without Firebase) or integrate directly if you provide Firebase config. Provide a `mockService` implementation that returns sample data for local UI rendering.

- Step E: Provide a theme token file and export a set of CSS variables for the components to use.

14) Example Lovable AI prompt (paste this into Lovable AI)

"Rebuild the AttendID React UI. Project uses React + Vite. Follow this spec: (paste entire DOCUMENTATION_FOR_LOVABLE_AI.md). Important constraints: keep existing component classNames exactly as listed so current logic can be reattached later; create per-component CSS files under src/page_styles; target responsive breakpoints 980/780/640/450/380; ensure accessibility: semantic HTML, labels for inputs, alt attributes. For Firebase calls create a mockService that returns sample JSON shaped like the data models described. Produce full component files for the pages and components in sections 4 and 5, plus a minimal router in src/main.jsx. Include README with run commands." 

15) Deliverables the AI should produce
- src/pages/* page components
- src/components/* components with documented props and a small story/example usage
- src/page_styles/* CSS files with variables and responsive rules
- src/services/mockService.js that mimics Firebase responses
- src/contexts/AuthContext.jsx skeleton that exposes signup/login/logout and a toggle for using mockService vs real Firebase
- README.md with dev instructions and what still needs manual wiring to the real Firebase project

---
Notes & tips:
- The repo currently has quirks (e.g., some code stores role in photoURL). Clean these up when rebuilding: store role in Firestore `users/{uid}.role` and keep photoURL strictly for photos.
- Preserve existing filenames and routes to avoid having to change backend logic.
- If converting to a different styling system (Tailwind, CSS Modules), keep classnames or provide a mapping table so existing JS doesn't break.

If you want, I can:
- Generate the Lovable AI prompt packaged (I can copy the full CONTENT above into a single prompt file) and commit it to the repo at `./lovable_prompt.txt`.
- Or I can run an automated pass that converts current components into a single UI spec JSON that Lovable AI can more directly consume (this will require extra steps).

Tell me which of the two you prefer and I will create the file or the prompt now.