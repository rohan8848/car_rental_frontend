import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/auth/AuthContext";
import api from "../services/api";
import {
  HomeIcon,
  UserIcon,
  LogoutIcon,
  BookmarkIcon,
  ClipboardListIcon,
  TruckIcon,
  HeartIcon,
} from "@heroicons/react/outline";

const navLinkStyles = `
  cursor-pointer 
  capitalize 
  text-sm 
  font-medium 
  tracking-wider
  relative 
  group 
  py-2
  px-4
  rounded-lg
  transition-all
  duration-300
  hover:bg-blue-600/20
  after:content-['']
  after:absolute
  after:bottom-0
  after:left-0
  after:w-full
  after:h-0.5
  after:bg-white
  after:transform
  after:scale-x-0
  after:origin-right
  after:transition-transform
  after:duration-300
  hover:after:scale-x-100
  hover:after:origin-left
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && isAuthenticated) {
      navigate("/auth/signin");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const response = await api.get("/wishlist");
        setWishlistCount(response.data.wishlist.length);
      } catch (error) {
        console.error("Error fetching wishlist count:", error);
      }
    };

    if (user) {
      fetchWishlistCount();
    }
  }, [user]);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    // Explicitly navigate to signin page
    window.location.href = "/auth/signin"; // Use window.location for a full page reload
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleBookingClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      // Store the intended destination
      localStorage.setItem("returnUrl", "/bookings");
      toast.warning("Please sign in first!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/auth/signin");
    }
  };

  // Hide navbar for admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white fixed w-full z-50 shadow-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:text-blue-200 transition-all duration-300 transform hover:scale-105"
          >
            Car Rental
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/user/dashboard" className={navLinkStyles}>
                  Dashboard
                </Link>

                <Link
                  to="/user/bookings"
                  className={navLinkStyles}
                  onClick={handleBookingClick}
                >
                  Book Now
                </Link>

                <Link to="/user/cars" className={navLinkStyles}>
                  Cars
                </Link>

                <Link to="/user/mybooking" className={navLinkStyles}>
                  My booking
                </Link>

                <Link to="/user/wishlist" className="text-white relative">
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full text-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div
                      className="w-10 h-10 rounded-full bg-white text-blue-700 
                      flex items-center justify-center text-sm font-bold
                      transition-all duration-300 hover:bg-blue-100 
                      hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      {user && getInitials(user.name)}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-3 w-56 bg-white rounded-lg 
                      shadow-xl py-2 text-gray-700 border border-gray-100
                      transform transition-all duration-300"
                    >
                      <Link
                        to="/user/dashboard"
                        className="block px-4 py-3 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/user/profile"
                        className="block px-4 py-3 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-red-600 
                          hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="text-blue-100 hover:text-white px-6 py-2 rounded-full 
                    transition-all duration-300 hover:bg-blue-600/30"
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-white text-blue-700 px-6 py-2 rounded-full
                    transition-all duration-300 hover:bg-blue-100 
                    hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <div
                className="w-8 h-8 rounded-full bg-white text-blue-700 
                flex items-center justify-center text-sm font-bold"
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-blue-600/30 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden transition-all duration-300 ${
            menuOpen ? "max-h-[400px] border-t border-blue-600/30" : "max-h-0"
          } overflow-hidden`}
        >
          <div className="py-4 px-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/user/dashboard"
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600/30 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <HomeIcon className="w-5 h-5 inline-block mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/user/bookings"
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600/30 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <ClipboardListIcon className="w-5 h-5 inline-block mr-2" />
                  Book Car
                </Link>
                <Link
                  to="/user/cars"
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600/30 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <TruckIcon className="w-5 h-5 inline-block mr-2" />
                  Cars
                </Link>
                <Link
                  to="/user/mybooking"
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600/30 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <BookmarkIcon className="w-5 h-5 inline-block mr-2" />
                  My Bookings
                </Link>
                <Link
                  to="/user/wishlist"
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600/30 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <HeartIcon className="w-5 h-5 inline-block mr-2" />
                  Wishlist
                </Link>
                <Link
                  to="/user/profile"
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-blue-600/30 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5 inline-block mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-4 text-red-300 
                    hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                >
                  <LogoutIcon className="w-5 h-5 inline-block mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2 px-4 border-t border-blue-600/30">
                <Link
                  to="/auth/signin"
                  className="block w-full text-center py-2 px-4 text-blue-100 hover:text-white 
                    hover:bg-blue-600/30 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="block w-full text-center py-2 px-4 bg-white text-blue-700 
                    rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
