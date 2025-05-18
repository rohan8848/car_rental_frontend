import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../pages/auth/AuthContext";
import { getFullImageUrl, getDriverImageUrl } from "../../utils/imageUtils";
import {
  FiClock,
  FiCalendar,
  FiMapPin,
  FiCheck,
  FiX,
  FiStar,
  FiTruck,
  FiFilter,
  FiUser,
  FiPhone,
} from "react-icons/fi";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({});
  const [driverReviewData, setDriverReviewData] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/bookings/user");
        if (Array.isArray(response.data)) {
          const sortedBookings = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          console.log("Received bookings data:", sortedBookings);

          const processedBookings = sortedBookings.map((booking) => {
            let processedBooking = { ...booking };

            if (booking.driverAssigned && booking.driver) {
              console.log(
                `Processing driver for booking ${booking._id}:`,
                booking.driver
              );

              let profileImage = booking.driver.profileImage;
              if (profileImage && !profileImage.startsWith("http")) {
                if (!profileImage.includes("/uploads/drivers/")) {
                  profileImage = `/uploads/drivers/${profileImage
                    .split("/")
                    .pop()}`;
                }

                if (!profileImage.startsWith("http")) {
                  profileImage = `http://localhost:4000${profileImage}`;
                }

                console.log("Fixed driver image path:", profileImage);
              }

              processedBooking.driver = {
                ...booking.driver,
                _id: booking.driver._id,
                name: booking.driver.name || "Driver Name Unavailable",
                experience: booking.driver.experience || "0",
                phone: booking.driver.phone || "Not Available",
                email: booking.driver.email || "Not Available",
                licenseNumber: booking.driver.licenseNumber || "Not Available",
                profileImage: profileImage || null,
              };

              console.log("Processed driver data:", processedBooking.driver);
            }

            return processedBooking;
          });

          setBookings(processedBookings);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (id) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this booking?"
      );
      if (!confirmed) return;

      await api.put(`/bookings/${id}/cancel`);
      setBookings(
        bookings.map((booking) =>
          booking._id === id ? { ...booking, status: "cancelled" } : booking
        )
      );
      toast.success("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleReviewChange = (carId, field, value) => {
    setReviewData({
      ...reviewData,
      [carId]: {
        ...reviewData[carId],
        [field]: value,
      },
    });
  };

  const handleReviewSubmit = async (carId) => {
    try {
      const data = reviewData[carId];
      if (!data || !data.rating || !data.comment) {
        toast.error("Please provide both rating and comment");
        return;
      }

      await api.post(`/reviews/car/${carId}/reviews`, data);
      toast.success("Review submitted successfully!");

      setReviewData({
        ...reviewData,
        [carId]: { rating: "", comment: "" },
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleDriverReviewChange = (driverId, field, value) => {
    setDriverReviewData({
      ...driverReviewData,
      [driverId]: {
        ...driverReviewData[driverId],
        [field]: value,
      },
    });
  };

  const handleDriverReviewSubmit = async (driverId) => {
    try {
      const data = driverReviewData[driverId];
      if (!data || !data.rating || !data.comment) {
        toast.error("Please provide both rating and comment");
        return;
      }

      console.log("Submitting driver review:", { driverId, data });

      const response = await api.post(`/reviews/driver/${driverId}`, data);

      if (response.data && response.data.success) {
        toast.success("Driver review submitted successfully!");

        setDriverReviewData({
          ...driverReviewData,
          [driverId]: { rating: "", comment: "" },
        });
      } else {
        toast.error(response.data?.message || "Failed to submit driver review");
      }
    } catch (error) {
      console.error("Error submitting driver review:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit driver review. Please try again."
      );
    }
  };

  const openDriverModal = async (driver) => {
    try {
      if (!driver || !driver._id) {
        console.error("Invalid driver data:", driver);
        toast.error("Driver information is incomplete");
        return;
      }

      setLoading(true);
      console.log("Opening modal with driver data:", driver);

      try {
        const response = await api.get(`/admin/drivers/${driver._id}`);

        if (response.data && response.data.success) {
          const completeDriverData = response.data.data;
          console.log("Fetched complete driver data:", completeDriverData);

          if (completeDriverData.profileImage) {
            completeDriverData.profileImage = getDriverImageUrl(
              completeDriverData.profileImage
            );
          }

          setCurrentDriver(completeDriverData);
        } else {
          const driverData = JSON.parse(JSON.stringify(driver));

          driverData.name = driverData.name || "Driver Name Unavailable";
          driverData.experience = driverData.experience || "0";
          driverData.phone = driverData.phone || "Not Available";
          driverData.email = driverData.email || "Not Available";
          driverData.licenseNumber =
            driverData.licenseNumber || "Not Available";
          driverData.reviews = driverData.reviews || [];
          driverData.rating = driverData.rating || 0;

          if (driverData.profileImage) {
            driverData.profileImage = getDriverImageUrl(
              driverData.profileImage
            );
          }

          setCurrentDriver(driverData);
        }
      } catch (error) {
        console.error("Error fetching complete driver data:", error);
        const driverData = JSON.parse(JSON.stringify(driver));

        if (driverData.profileImage) {
          driverData.profileImage = getDriverImageUrl(driverData.profileImage);
        }

        setCurrentDriver(driverData);
      }

      setIsDriverModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error("Error in openDriverModal:", error);
      toast.error("Unable to load driver information. Please try again later.");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getFilteredBookings = () => {
    if (activeFilter === "All") {
      return bookings;
    }
    return bookings.filter(
      (booking) => booking.status.toLowerCase() === activeFilter.toLowerCase()
    );
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const bookingsByCar = completedBookings.reduce((acc, booking) => {
    const carId = booking.car._id;
    if (!acc[carId]) {
      acc[carId] = [];
    }
    acc[carId].push(booking);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-4 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Bookings
          </span>
        </h1>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-xl text-center"
          >
            <div className="flex flex-col items-center justify-center p-8">
              <FiTruck className="text-gray-300 w-24 h-24 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700">
                No bookings yet
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                You haven't made any bookings yet. Explore our cars and book
                your first ride!
              </p>
              <button
                onClick={() => navigate("/user/cars")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Browse Cars
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center mb-2">
                <FiFilter className="mr-2 text-blue-600" />
                <span className="font-medium text-gray-700">
                  Filter by Status:
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  "All",
                  "Pending",
                  "Confirmed",
                  "Active",
                  "Completed",
                  "Cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeFilter === status
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handleFilterChange(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-md text-center">
                <div className="flex flex-col items-center justify-center p-4">
                  <FiTruck className="text-gray-300 w-16 h-16 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    No {activeFilter !== "All" ? activeFilter : ""} bookings
                    found
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {activeFilter !== "All"
                      ? `You don't have any bookings with status "${activeFilter}".`
                      : "No bookings match your filters."}
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                  >
                    <div className="relative">
                      <div
                        className={`absolute top-0 right-0 ${getStatusColor(
                          booking.status
                        )} text-white px-4 py-2 rounded-bl-xl font-medium`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </div>

                      {booking.needsDriver && (
                        <div className="absolute top-0 left-0 bg-blue-500 text-white px-4 py-2 rounded-br-xl font-medium flex items-center">
                          <FiUser className="mr-2" />
                          With Driver
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                          {booking.car?.images &&
                          booking.car.images.length > 0 ? (
                            <div className="rounded-xl overflow-hidden h-56 mb-4 shadow-md">
                              <img
                                src={getFullImageUrl(booking.car.images[0])}
                                alt={booking.car?.name || "Car"}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-200 rounded-xl h-56 mb-4 flex items-center justify-center">
                              <FiTruck className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          <div>
                            <h3 className="text-xl font-bold mb-1 text-gray-800">
                              {booking.car?.name || "Unknown Car"}
                            </h3>
                            <div className="flex items-center text-gray-600 space-x-2 mb-2">
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {booking.car?.brand}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {booking.car?.type}
                              </span>
                            </div>
                            <p className="font-semibold text-blue-600">
                              Rs. {booking.car?.price}/day
                            </p>
                          </div>
                        </div>

                        <div className="w-full md:w-2/3 flex flex-col">
                          <div className="flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                                    <FiCalendar className="mr-2 text-blue-500" />{" "}
                                    Booking Period
                                  </h4>
                                  <div className="pl-6 space-y-2">
                                    <p className="text-gray-600">
                                      <span className="font-medium">From:</span>{" "}
                                      {new Date(
                                        booking.startDate
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">To:</span>{" "}
                                      {new Date(
                                        booking.endDate
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">
                                        Duration:
                                      </span>{" "}
                                      {Math.ceil(
                                        (new Date(booking.endDate) -
                                          new Date(booking.startDate)) /
                                          (1000 * 60 * 60 * 24)
                                      )}{" "}
                                      days
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                                    <FiMapPin className="mr-2 text-blue-500" />{" "}
                                    Location
                                  </h4>
                                  <div className="pl-6">
                                    <p className="text-gray-600">
                                      {booking.address || "Not specified"}
                                    </p>
                                  </div>
                                </div>

                                {booking.needsDriver && (
                                  <div>
                                    <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                                      <FiUser className="mr-2 text-blue-500" />{" "}
                                      Driver Service
                                    </h4>
                                    <div className="pl-6">
                                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                        <p className="text-blue-700 font-medium">
                                          Professional driver included
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Fee: Rs. 1,000 ×{" "}
                                          {Math.ceil(
                                            (new Date(booking.endDate) -
                                              new Date(booking.startDate)) /
                                              (1000 * 60 * 60 * 24)
                                          )}{" "}
                                          days = Rs.{" "}
                                          {1000 *
                                            Math.ceil(
                                              (new Date(booking.endDate) -
                                                new Date(booking.startDate)) /
                                                (1000 * 60 * 60 * 24)
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                                    <FiClock className="mr-2 text-blue-500" />{" "}
                                    Status Details
                                  </h4>
                                  <div className="pl-6">
                                    <p className="text-gray-600">
                                      <span className="font-medium">
                                        Booked on:
                                      </span>{" "}
                                      {new Date(
                                        booking.createdAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                    <p className="text-gray-600">
                                      <span className="font-medium">
                                        Booking ID:
                                      </span>{" "}
                                      #{booking._id.slice(-6).toUpperCase()}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">
                                    Payment
                                  </h4>
                                  <div className="pl-6">
                                    <p className="text-xl font-bold text-blue-600">
                                      Rs.{" "}
                                      {booking.totalAmount ||
                                        (booking.car?.price +
                                          (booking.needsDriver ? 1000 : 0)) *
                                          Math.ceil(
                                            (new Date(booking.endDate) -
                                              new Date(booking.startDate)) /
                                              (1000 * 60 * 60 * 24)
                                          )}
                                    </p>
                                    {booking.needsDriver && (
                                      <p className="text-sm text-gray-500">
                                        Includes driver service
                                      </p>
                                    )}
                                    {booking.paymentMethod === "khalti" &&
                                      booking.transactionId && (
                                        <p className="text-sm text-purple-700 font-medium mt-1">
                                          Khalti Transaction ID:{" "}
                                          {booking.transactionId}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {booking.driverAssigned && booking.driver && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium mb-3 flex items-center text-blue-800">
                                  <FiUser className="mr-2" /> Your Assigned
                                  Driver
                                </h4>
                                <button
                                  onClick={() => {
                                    console.log(
                                      "Sending driver data to modal:",
                                      booking.driver
                                    );
                                    if (booking.driver && booking.driver._id) {
                                      openDriverModal(booking.driver);
                                    } else {
                                      toast.error(
                                        "Driver information is incomplete"
                                      );
                                    }
                                  }}
                                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                  View Details
                                </button>
                              </div>
                              <div className="flex items-center">
                                {booking.driver.profileImage ? (
                                  <img
                                    src={getDriverImageUrl(
                                      booking.driver.profileImage
                                    )}
                                    alt={booking.driver.name || "Driver"}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                    onError={(e) => {
                                      console.log(
                                        "Driver image failed to load:",
                                        booking.driver.profileImage
                                      );
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/50?text=Driver";
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                                    <FiUser
                                      size={24}
                                      className="text-blue-500"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">
                                    {booking.driver.name ||
                                      "Driver Name Unavailable"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Experience:{" "}
                                    {booking.driver.experience
                                      ? `${booking.driver.experience} years`
                                      : "Not specified"}
                                  </p>
                                  <p className="text-sm text-blue-700 flex items-center mt-1">
                                    <FiPhone className="mr-1" />{" "}
                                    {booking.driver.phone || "Not Available"}
                                  </p>
                                </div>
                              </div>

                              {booking.status === "completed" && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                  <p className="text-sm font-medium text-blue-800 mb-2">
                                    Rate your driver:
                                  </p>
                                  <div className="flex space-x-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                          handleDriverReviewChange(
                                            booking.driver._id,
                                            "rating",
                                            star
                                          )
                                        }
                                        className={`text-xl ${
                                          (driverReviewData[booking.driver._id]
                                            ?.rating || 0) >= star
                                            ? "text-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={
                                      driverReviewData[booking.driver._id]
                                        ?.comment || ""
                                    }
                                    onChange={(e) =>
                                      handleDriverReviewChange(
                                        booking.driver._id,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Share your experience with this driver..."
                                    className="w-full text-sm p-2 border border-blue-200 rounded mt-1 focus:ring-blue-400 focus:border-blue-400"
                                    rows="2"
                                  ></textarea>
                                  <button
                                    onClick={() =>
                                      handleDriverReviewSubmit(
                                        booking.driver._id
                                      )
                                    }
                                    className="mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                                  >
                                    Submit Review
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {booking.needsDriver && !booking.driverAssigned && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                              <p className="text-sm text-yellow-700 flex items-center">
                                <FiClock className="mr-2" /> Driver requested -
                                waiting for assignment
                              </p>
                            </div>
                          )}

                          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-4">
                            {booking.status === "pending" && (
                              <button
                                onClick={() => handleCancel(booking._id)}
                                className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-medium rounded-lg flex items-center transition-all"
                              >
                                <FiX className="mr-2" /> Cancel Booking
                              </button>
                            )}
                            {booking.status === "completed" && (
                              <button
                                onClick={() =>
                                  navigate(`/user/review/${booking.car._id}`)
                                }
                                className="px-6 py-2 bg-purple-100 hover:bg-purple-200 text-purple-600 font-medium rounded-lg flex items-center transition-all"
                              >
                                <FiStar className="mr-2" /> Write Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {Object.keys(bookingsByCar).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">Rate Your Experiences</h2>

            <div className="space-y-8">
              {Object.entries(bookingsByCar).map(([carId, carBookings]) => {
                const car = carBookings[0].car;
                return (
                  <div
                    key={carId}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center mb-4">
                      {car.images && car.images.length > 0 ? (
                        <img
                          src={getFullImageUrl(car.images[0])}
                          alt={car.name}
                          className="w-16 h-16 rounded-lg object-cover mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                          <FiTruck className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold">{car.name}</h3>
                        <p className="text-sm text-gray-600">
                          {car.brand} • {car.type}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating
                        </label>
                        <div className="flex space-x-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                handleReviewChange(carId, "rating", star)
                              }
                              className={`text-2xl ${
                                (reviewData[carId]?.rating || 0) >= star
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Comments
                        </label>
                        <textarea
                          value={reviewData[carId]?.comment || ""}
                          onChange={(e) =>
                            handleReviewChange(carId, "comment", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          placeholder="Share your experience with this car..."
                        ></textarea>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReviewSubmit(carId)}
                          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {isDriverModalOpen && currentDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Driver Details
                </h3>
                <button
                  onClick={() => setIsDriverModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  {currentDriver.profileImage ? (
                    <img
                      src={currentDriver.profileImage}
                      alt={currentDriver.name}
                      className="w-40 h-40 rounded-full object-cover"
                      onError={(e) => {
                        console.log(
                          "Modal driver image failed to load:",
                          currentDriver.profileImage
                        );
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=Driver";
                      }}
                    />
                  ) : (
                    <div className="w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser size={60} className="text-blue-500" />
                    </div>
                  )}
                  <h4 className="mt-4 text-xl font-semibold">
                    {currentDriver.name}
                  </h4>

                  <div className="flex items-center mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.round(currentDriver.rating || 0)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-gray-600">
                      {currentDriver.rating
                        ? `${currentDriver.rating.toFixed(1)} / 5`
                        : "Not rated"}
                    </span>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Driver Information
                    </h4>
                    <div className="grid grid-cols-1 gap-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Experience:</span>
                        <span className="font-medium text-gray-900">
                          {currentDriver.experience} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">License Number:</span>
                        <span className="font-medium text-gray-900">
                          {currentDriver.licenseNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contact:</span>
                        <span className="font-medium text-gray-900">
                          {currentDriver.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium text-gray-900">
                          {currentDriver.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiStar className="mr-2 text-yellow-500" /> Reviews
                    </h4>

                    {currentDriver.reviews &&
                    currentDriver.reviews.length > 0 ? (
                      <div className="space-y-4 mt-2 max-h-60 overflow-y-auto pr-2">
                        {currentDriver.reviews.map((review, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                          >
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < review.rating
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mt-2 text-gray-700">
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-2">
                        No reviews yet for this driver.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
