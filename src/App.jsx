import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Member from './pages/Member';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import PublicScan from './pages/PublicScan';
import ScanForm from './pages/ScanForm';
import SessionCheckin from './pages/SessionCheckin';
import ParticipantScan from './components/ParticipantScan';
import GateReport from './components/AdminReports';
import About from './pages/About';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserAgreement from './pages/UserAgreement';
import DataRetentionPolicy from './pages/DataRetentionPolicy';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router basename="/ScanIn-Attendance">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/scan" element={<PublicScan />} />
            <Route path="/scan-form/:qrId" element={<ScanForm />} />
            <Route path="/participant-scan" element={<ParticipantScan/>}/>
            <Route path="/session-checkin/:sessionId" element={<SessionCheckin/>}/>
            <Route path="/cookie-policy" element={<CookiePolicy/>}/>
            <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
            <Route path="/user-agreement" element={<UserAgreement/>}/>
            <Route path="/data-retention-policy" element={<DataRetentionPolicy/>}/>
            <Route path="/reports" element={<GateReport/>}/>
            <Route path="/about" element={<About/>}/>

            <Route 
              path="/member" 
              element={
                <ProtectedRoute requiredRole="member">
                  <Member />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
