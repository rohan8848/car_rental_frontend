import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa"; // Added for driver icon
import { useAdminAuth } from "../context/AdminAuthContext";

const menuItems = [
  { title: "Dashboard", path: "/admin", icon: FiHome },
  { title: "Cars", path: "/admin/manage-cars", icon: FaCarSide },
  { title: "Bookings", path: "/admin/manage-bookings", icon: FiCalendar },
  { title: "Users", path: "/admin/manage-users", icon: FiUsers },
  { title: "Drivers", path: "/admin/manage-drivers", icon: FaUserTie }, // New menu item
  { title: "Car Reviews", path: "/admin/reviews", icon: FiStar },
  { title: "Client Testimonials", path: "/admin/client-reviews", icon: FiStar },
  { title: "Messages", path: "/admin/messages", icon: FiMessageSquare },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAdminAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sticky inset-0 bg-black bg-opacity-50 z-40 lg:hidden  top-0"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-xl lg:relative lg:translate-x-0 overflow-hidden"
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-950/50 backdrop-blur-sm">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-800/50"
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map(({ title, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-blue-950/20 scale-105"
                    : "hover:bg-white/5 hover:scale-102"
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-red-400 hover:text-red-300"
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
