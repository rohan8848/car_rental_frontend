import React from "react";
import { motion } from "framer-motion";

const BookingCard = ({ booking }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.pending;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {booking.car && booking.car.name ? booking.car.name : "Car"}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>Booking ID: #{booking._id}</p>
          <p>
            From: {new Date(booking.startDate).toLocaleDateString()} To:{" "}
            {new Date(booking.endDate).toLocaleDateString()}
          </p>
          <p className="text-lg font-semibold text-blue-600">
            ${booking.totalAmount}
          </p>
        </div>

        <div className="mt-4 flex space-x-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Details
          </button>
          {booking.status === "active" && (
            <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookingCard;
