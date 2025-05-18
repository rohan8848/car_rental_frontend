import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading, checkAuthStatus } = useAdminAuth();
  const location = useLocation();

  // On first render, check for token even if context says not authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken && !isAdminAuthenticated) {
      console.log(
        "Found adminToken but not authenticated, rechecking auth status..."
      );
      checkAuthStatus();
    }
  }, [isAdminAuthenticated, checkAuthStatus]);

  console.log("ProtectedAdminRoute: Auth state", {
    isAdminAuthenticated,
    loading,
    path: location.pathname,
    hasToken: !!localStorage.getItem("adminToken"),
  });

  // If token exists but still loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-3 text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // Force check localStorage as backup
  const token = localStorage.getItem("adminToken");

  // Either context says authenticated OR we have a token in localStorage
  if (isAdminAuthenticated || token) {
    console.log(
      "Admin is authenticated or has token, rendering protected content"
    );
    return children;
  }

  console.log(
    "Admin not authenticated, redirecting to login from ProtectedAdminRoute"
  );
  return (
    <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  );
};

export default ProtectedAdminRoute;
