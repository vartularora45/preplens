import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import toast from 'react-hot-toast';
import { TimerIcon } from "lucide-react";


const UserProtect = ({ children }) => {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setShowLoader(false);
  }, 3000); // ⏳ minimum loader time

  return () => clearTimeout(timer);
}, []);
  const toastShown = useRef(false); 

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      if (!toastShown.current) {
        toast.success("⚠️ Login required! Access denied.");
        toastShown.current = true;
      }
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");

        if (!toastShown.current) {
          toast.error("⏳ Session expired! Please login again.");
          toastShown.current = true;
        }

        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      localStorage.removeItem("token");

      if (!toastShown.current) {
        toast.error("🚫 Invalid token! Login again.");
        toastShown.current = true;
      }

      setIsAuthorized(false);
    }
  }, []);

  // ⏳ Smooth loader
  // ⏳ Loader
if (isAuthorized === null || showLoader) {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
  <div className="flex flex-col items-center gap-6">

    {/* Soft Card */}
    <div className="w-24 h-24 flex items-center justify-center
      border border-white/10
      bg-white/[0.02]
      rounded-xl
      shadow-[0_0_40px_rgba(255,255,255,0.03)]">

      {/* Minimal Spinner */}
      <div className="w-8 h-8 border border-white/30 border-t-white rounded-full animate-spin" />
    </div>

    {/* Text */}
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm tracking-[0.3em] text-white/80 uppercase">
        Authenticating
      </p>
      <p className="text-xs text-white/30">
        Initializing intelligence layer
      </p>
    </div>

  </div>
</div>

  );
}


  
  if (!isAuthorized) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserProtect;
