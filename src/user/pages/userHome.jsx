import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../pages/auth/AuthContext";
import Navbar from "../../components/Navbar";
import BookingCard from "../components/BookingCard";
import CarCard from "../components/CarCard";
import ActivityCard from "../components/ActivityCard";
import QuickActionCard from "../components/QuickActionCard";
import RecentActivity from "../components/RecentActivity";
import PopularCars from "../components/PopularCars";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import api from "../../services/api";

const UserHome = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [popularCars, setPopularCars] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      easing: "ease-in-out", // Smooth easing for animations
      once: false, // Ensures animations run only once on scroll
    });
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <motion.div
        className=" px-4 md:px-8 pb-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div
            className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300"
            data-aos="fade-up"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome back, <span className="text-blue-600">{user?.name}</span>!
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div data-aos="fade-up" data-aos-delay="100">
                <QuickActionCard
                  title="My Bookings"
                  description="View and manage your car rentals"
                  icon="🚗"
                  bgColor="bg-blue-50"
                  buttonColor="bg-blue-600"
                  onClick={() => navigate("/user/bookings")}
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="200">
                <QuickActionCard
                  title="Quick Rent"
                  description="Browse available cars for rental"
                  icon="🔑"
                  bgColor="bg-green-50"
                  buttonColor="bg-green-600"
                  onClick={() => navigate("/user/cars")}
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="300">
                <QuickActionCard
                  title="Profile Settings"
                  description="Update your account information"
                  icon="👤"
                  bgColor="bg-purple-50"
                  buttonColor="bg-purple-600"
                  onClick={() => navigate("/user/profile")}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <RecentActivity data-aos="fade-right" />
          </div>

          <div
            className="bg-white rounded-2xl shadow-xl p-8 mt-8"
            data-aos="fade-up"
          >
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div> */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserHome;
