import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import toast,{Toaster} from "react-hot-toast";
import UserProtect from "./protect/UserProtect.jsx";
import LandingPage from "./pages/LandingPage.jsx";
export default function App() {
  return (
    <>
     <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#09090b',
            color: '#d4d4d8',
            border: '1px solid #27272a'
          }
        }}
      />
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/dashboard/*" element={
          <UserProtect><Dashboard /></UserProtect>
        } />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  );
}
