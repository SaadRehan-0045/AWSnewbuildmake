import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import CreatePost from './components/CreatePost';
import DetailView from './components/DetailView';
import Update from './components/Update';
import MyAnimes from './components/MyAnimes';
import ForgotPassword from './components/ForgotPassword';
import VerifyOTP from './components/VerifyOTP';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <GoogleOAuthProvider clientId="695955642987-febh4f8bj0f452rmr1lvr7i55qeq4hc4.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-animes"
                element={
                  <ProtectedRoute>
                    <MyAnimes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/details/:id"
                element={
                  <ProtectedRoute>
                    <DetailView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update/:id"
                element={
                  <ProtectedRoute>
                    <Update />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;