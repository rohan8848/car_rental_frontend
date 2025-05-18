import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../pages/auth/AuthContext";

const UserNav = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white fixed w-full z-50 shadow-lg top-0">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:text-blue-200 transition-all duration-300 transform hover:scale-105"
          >
            Car Rental
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <NavLink
              to="/user/home"
              className={({ isActive }) =>
                isActive ? "text-green-600 font-bold" : "text-gray-600"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/user/bookings"
              className={({ isActive }) =>
                isActive ? "text-green-600 font-bold" : "text-gray-600"
              }
            >
              Bookings
            </NavLink>
            <NavLink
              to="/user/profile"
              className={({ isActive }) =>
                isActive ? "text-green-600 font-bold" : "text-gray-600"
              }
            >
              Profile
            </NavLink>
            <NavLink
              to="/user/cars"
              className={({ isActive }) =>
                isActive ? "text-green-600 font-bold" : "text-gray-600"
              }
            >
              Cars
            </NavLink>

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
                    to="/user/home"
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
          </div>

          <div className="lg:hidden flex items-center space-x-4">
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
            <NavLink
              to="/user/home"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-bold" : "text-gray-600"
              }
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/user/bookings"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-bold" : "text-gray-600"
              }
              onClick={() => setMenuOpen(false)}
            >
              Bookings
            </NavLink>
            <NavLink
              to="/user/profile"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-bold" : "text-gray-600"
              }
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </NavLink>
            <NavLink
              to="/user/cars"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-bold" : "text-gray-600"
              }
              onClick={() => setMenuOpen(false)}
            >
              Cars
            </NavLink>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-red-600 
                hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNav;
