import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function TestLogin() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔐 Test Login Page</h1>
      <p>If you can see this, React Router is working!</p>
      <div style={{ marginTop: '20px' }}>
        <input type="email" placeholder="Email" style={{ padding: '10px', marginRight: '10px' }} />
        <input type="password" placeholder="Password" style={{ padding: '10px', marginRight: '10px' }} />
        <button style={{ padding: '10px 20px' }}>Sign In</button>
      </div>
      <p style={{ marginTop: '20px' }}>
        <a href="/auth/signup">Go to signup</a> | <a href="/feed">Try to access feed (should redirect)</a>
      </p>
    </div>
  );
}

function TestSignup() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📝 Test Signup Page</h1>
      <p>If you can see this, the signup route is working!</p>
      <p><a href="/auth/login">Back to login</a></p>
    </div>
  );
}

function TestProtected() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🛡️ Protected Content</h1>
      <p>You should NOT see this without authentication!</p>
    </div>
  );
}

export default function TestApp() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<TestLogin />} />
        <Route path="/auth/signup" element={<TestSignup />} />
        <Route path="/feed" element={<TestProtected />} />
        <Route path="/profile" element={<TestProtected />} />
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}