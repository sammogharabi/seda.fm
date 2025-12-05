import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Simple protected content for testing
function SimpleFeed() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎵 Feed (Protected)</h1>
      <p>You successfully accessed a protected route!</p>
      <button onClick={() => window.location.href = '/auth/login'}>Logout (Test)</button>
    </div>
  );
}

function SimpleProfile() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>👤 Profile (Protected)</h1>
      <p>This is also a protected route!</p>
      <button onClick={() => window.location.href = '/auth/login'}>Logout (Test)</button>
    </div>
  );
}

export default function SimpleApp() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={
          <ProtectedRoute>
            <SimpleFeed />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <SimpleProfile />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}