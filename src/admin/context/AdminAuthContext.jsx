import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const isMounted = useRef(true);
  const checkAuthTimeoutRef = useRef(null);
  const tokenCheckFailuresRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      console.log(
        "Admin token found in localStorage - setting initial authenticated state"
      );
      setIsAdminAuthenticated(true);
    }

    if (
      window.location.pathname.startsWith("/admin") &&
      window.location.pathname !== "/admin/login"
    ) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
      if (checkAuthTimeoutRef.current) {
        clearTimeout(checkAuthTimeoutRef.current);
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        console.log("AdminAuthContext: No token found");
        if (isMounted.current) {
          setIsAdminAuthenticated(false);
          setLoading(false);
        }
        return false;
      }

      console.log("AdminAuthContext: Token found, verifying...");

      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const response = await api.get("/admin/check-auth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          _bypassInterceptor: true,
        });

        if (response.data && response.data.success) {
          console.log("Admin auth check successful:", response.data);
          if (isMounted.current) {
            setIsAdminAuthenticated(true);
            tokenCheckFailuresRef.current = 0;
            scheduleAuthCheck();
          }
          return true;
        } else {
          console.warn(
            "Admin auth check returned success:false",
            response.data
          );
          throw new Error("Invalid auth response");
        }
      } catch (error) {
        console.error("Admin auth check error:", error);
        tokenCheckFailuresRef.current += 1;

        if (tokenCheckFailuresRef.current >= 3) {
          console.warn("Multiple auth check failures, logging out admin");
          if (isMounted.current) {
            setIsAdminAuthenticated(false);
            localStorage.removeItem("adminToken");
          }
          return false;
        } else {
          console.log(
            `Auth check failed (${tokenCheckFailuresRef.current}/3) but not clearing session yet`
          );
          if (isMounted.current) {
            setIsAdminAuthenticated(true);
          }
          return true;
        }
      }
    } catch (error) {
      console.error("Admin auth check error:", error);
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const scheduleAuthCheck = () => {
    if (checkAuthTimeoutRef.current) {
      clearTimeout(checkAuthTimeoutRef.current);
    }

    checkAuthTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        checkAuthStatus();
      }
    }, 15 * 60 * 1000);
  };

  const login = async (credentials) => {
    try {
      localStorage.removeItem("token");

      if (credentials.token) {
        console.log("Using existing token from OTP verification");
        setIsAdminAuthenticated(true);

        if (!credentials.skipTokenCheck) {
          setTimeout(() => checkAuthStatus(), 500);
        }

        return { success: true };
      }

      const response = await api.post("/admin/login", credentials);
      if (response.data.success && response.data.token) {
        const token = response.data.token;
        localStorage.setItem("adminToken", token);
        setIsAdminAuthenticated(true);
        tokenCheckFailuresRef.current = 0;
        return { success: true };
      }
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAdminAuthenticated(false);
    tokenCheckFailuresRef.current = 0;
    navigate("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        admin,
        login,
        logout,
        loading,
        checkAuthStatus,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
