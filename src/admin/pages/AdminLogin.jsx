import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAdminAuth } from "../context/AdminAuthContext"; // Import auth context

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();
  const { login, checkAuthStatus } = useAdminAuth(); // Get login function from context

  // Clear any user tokens when accessing admin login
  useEffect(() => {
    // When entering admin login, remove regular user token to avoid confusion
    localStorage.removeItem("token");
  }, []);

  const requestLoginOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/admin/login", { username, password });
      if (response.data.requireOTP) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
      } else {
        // Direct login successful with token (no OTP required)
        const token = response.data.token;
        localStorage.setItem("adminToken", token);

        // Update auth context state
        await login({ username, password, token });

        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting OTP verification with:", { username, otp });
      const response = await api.post("/admin/login", {
        username,
        password,
        otp,
      });

      if (response.data.success && response.data.token) {
        console.log("Login successful, token received:", response.data.token);

        // Store token in localStorage
        localStorage.setItem("adminToken", response.data.token);

        // Set auth state without immediate verification
        await login({
          username,
          password,
          token: response.data.token,
          skipTokenCheck: true, // Skip immediate token verification
        });

        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const requestRegisterOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add email to request
      const response = await api.post("/admin/request-otp", {
        username,
        password,
        email: "rohanrimal7@gmail.com", // Explicitly specify the target email
      });

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);

        // In development, if there's a devNote, show it (which may include the OTP)
        if (response.data.devNote) {
          toast.info(response.data.devNote);
        }
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);

      // More detailed error handling
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to send OTP");
      } else {
        toast.error("Network error, please check server connection");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/admin/create", { username, otp });

      if (response.data.success) {
        toast.success("Admin account created! Please login.");
        setShowRegisterForm(false);
        setOtpSent(false);
        setOtp("");
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtp("");
    setShowRegisterForm(!showRegisterForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300">
      <div className="max-w-md w-full bg-gray-200 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {showRegisterForm ? "Register Admin" : "Admin Login"}
        </h2>

        {!otpSent ? (
          <form
            onSubmit={showRegisterForm ? requestRegisterOtp : requestLoginOtp}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  {showRegisterForm ? "Sending OTP..." : "Requesting OTP..."}
                </div>
              ) : (
                <span>{showRegisterForm ? "Request OTP" : "Login"}</span>
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={showRegisterForm ? handleRegister : handleLoginWithOtp}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter OTP sent to rohanrimal7@gmail.com
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Verifying...
                </div>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={resetForm}
            className="text-blue-600 hover:text-blue-800"
          >
            {otpSent
              ? "Back to Form"
              : showRegisterForm
              ? "Back to Login"
              : "Register as Admin"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-800">
            Go to User Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
