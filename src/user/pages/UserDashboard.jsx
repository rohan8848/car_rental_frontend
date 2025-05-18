import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../pages/auth/AuthContext";
import api from "../../services/api";
import {
  FiMapPin,
  FiClock,
  FiCalendar,
  FiHeart,
  FiUser,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { format } from "date-fns";
import Map from "../../components/Map"; // Import the clean Map component

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    lng: 85.324,
    lat: 27.7172,
  }); // Default to Kathmandu
  const [destination, setDestination] = useState(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedRides: 0,
    cancelledBookings: 0,
    upcomingBookings: 0,
    favoriteLocations: 0,
  });

  useEffect(() => {
    fetchUserData();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentLocation({ lng: longitude, lat: latitude });
        },
        (err) => {
          console.log("Location access denied", err);
        }
      );
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const bookingsResponse = await api.get("/bookings/user");
      setBookings(bookingsResponse.data || []);

      const recentOnes = (bookingsResponse.data || []).slice(0, 3);
      setRecentBookings(recentOnes);

      const completedRides = (bookingsResponse.data || []).filter(
        (b) => b.status === "completed"
      ).length;
      const cancelledBookings = (bookingsResponse.data || []).filter(
        (b) => b.status === "cancelled"
      ).length;
      const upcomingBookings = (bookingsResponse.data || []).filter((b) =>
        ["pending", "confirmed"].includes(b.status)
      ).length;

      const dummyLocations = [
        {
          name: "Home",
          address: "123 Main St, Kathmandu",
          coordinates: { lat: 27.7624, lng: 85.3387 },
        },
        {
          name: "Office",
          address: "456 Work Ave, Kathmandu",
          coordinates: { lat: 27.7172, lng: 85.324 },
        },
        {
          name: "Mall",
          address: "789 Shop Blvd, Kathmandu",
          coordinates: { lat: 27.7041, lng: 85.3131 },
        },
      ];
      setFavoriteLocations(dummyLocations);

      setStats({
        totalBookings: (bookingsResponse.data || []).length,
        completedRides,
        cancelledBookings,
        upcomingBookings,
        favoriteLocations: dummyLocations.length,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch your data. Please try again.");
    }
  };

  const searchLocation = async (e) => {
    e.preventDefault();
    if (!locationSearchQuery) return;

    try {
      const address = locationSearchQuery.toLowerCase();
      let lat = 27.7172;
      let lng = 85.324;

      if (address.includes("thamel")) {
        lat = 27.7154;
        lng = 85.3123;
      } else if (address.includes("patan") || address.includes("lalitpur")) {
        lat = 27.6674;
        lng = 85.3262;
      } else if (address.includes("bhaktapur")) {
        lat = 27.671;
        lng = 85.4298;
      }

      setDestination({ lat, lng });
      toast.success("Location found!");
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Location search failed. Please try again.");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLocationSelect = (location, locationName) => {
    setDestination(location);
    setLocationSearchQuery(
      locationName ||
        `Location at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
    );
    sendLocationToBackend(location);
  };

  const sendLocationToBackend = async (location) => {
    try {
      await api.post("/users/location", {
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending location to backend:", error);
      toast.error("Could not save location data to server");
    }
  };

  const handleBookCar = () => {
    if (!destination) {
      toast.warning("Please select a destination first!");
      return;
    }

    sessionStorage.setItem("selectedDestination", JSON.stringify(destination));
    sessionStorage.setItem("locationSearchQuery", locationSearchQuery);
    navigate("/user/bookings");
  };

  const saveLocationAsFavorite = () => {
    if (!destination) {
      toast.warning("Please select a location first!");
      return;
    }

    const newFavorite = {
      name: locationSearchQuery.split(",")[0] || "New Location",
      address: locationSearchQuery,
      coordinates: destination,
    };

    setFavoriteLocations([...favoriteLocations, newFavorite]);
    toast.success("Location saved to favorites!");
  };

  const selectFavoriteLocation = (location) => {
    setDestination(location.coordinates);
    setLocationSearchQuery(location.address);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      if (response.data) {
        toast.success("Booking cancelled successfully");
        setBookings(
          bookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center"
          >
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-blue-100">
                Access your profile, bookings, and favorite locations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm text-blue-200">My Account</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </motion.div>
          <div className="mt-8 flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600 font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange("bookings")}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === "bookings"
                  ? "bg-white text-blue-600 font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => handleTabChange("map")}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === "map"
                  ? "bg-white text-blue-600 font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`px-4 py-2 rounded-t-lg transition-all ${
                activeTab === "profile"
                  ? "bg-white text-blue-600 font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Profile Settings
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 pt-6">
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalBookings}
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiCalendar size={20} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Completed Rides</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.completedRides}
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FaCar size={20} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-yellow-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.upcomingBookings}
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <FiClock size={20} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-purple-500"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Favorite Locations</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.favoriteLocations}
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <FiHeart size={20} />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      Recent Bookings
                    </h2>
                    <button
                      onClick={() => handleTabChange("bookings")}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View all
                    </button>
                  </div>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="border border-gray-100 rounded-lg p-4 transition-all hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 p-3 rounded-md">
                                <FaCar className="text-blue-600 w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {booking.car?.name || "Car Booking"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {format(
                                    new Date(booking.startDate),
                                    "MMM dd, yyyy"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    new Date(booking.endDate),
                                    "MMM dd, yyyy"
                                  )}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No recent bookings found</p>
                      <button
                        onClick={() => navigate("/user/bookings")}
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        Book a car now
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      Quick Location
                    </h2>
                    <button
                      onClick={() => handleTabChange("map")}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Open full map
                    </button>
                  </div>
                  <Map
                    onLocationChange={handleLocationSelect}
                    initialLocation={currentLocation}
                  />

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={handleBookCar}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book a Car
                    </button>

                    <button
                      onClick={saveLocationAsFavorite}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Save Location
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <p className="text-gray-500">{user?.phone}</p>

                    <div className="w-full mt-6 space-y-2">
                      <button
                        onClick={() => navigate("/user/profile")}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiSettings size={16} />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => logout()}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiLogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Favorite Locations
                  </h2>
                  {favoriteLocations.length > 0 ? (
                    <div className="space-y-3">
                      {favoriteLocations.map((location, index) => (
                        <div
                          key={index}
                          onClick={() => selectFavoriteLocation(location)}
                          className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="bg-purple-100 p-2 rounded-md">
                            <FaMapMarkerAlt className="text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{location.name}</h3>
                            <p className="text-xs text-gray-500 truncate">
                              {location.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      No favorite locations yet
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Quick Actions
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate("/user/bookings")}
                      className="p-4 bg-blue-50 hover:bg-blue-100 transition-all rounded-lg flex flex-col items-center"
                    >
                      <FaCar className="text-blue-600 mb-2" size={20} />
                      <span className="text-sm text-blue-700">Book Car</span>
                    </button>

                    <button
                      onClick={() => navigate("/user/mybooking")}
                      className="p-4 bg-green-50 hover:bg-green-100 transition-all rounded-lg flex flex-col items-center"
                    >
                      <FiCalendar className="text-green-600 mb-2" size={20} />
                      <span className="text-sm text-green-700">
                        My Bookings
                      </span>
                    </button>

                    <button
                      onClick={() => navigate("/user/wishlist")}
                      className="p-4 bg-red-50 hover:bg-red-100 transition-all rounded-lg flex flex-col items-center"
                    >
                      <FiHeart className="text-red-600 mb-2" size={20} />
                      <span className="text-sm text-red-700">Wishlist</span>
                    </button>

                    <button
                      onClick={() => navigate("/user/profile")}
                      className="p-4 bg-yellow-50 hover:bg-yellow-100 transition-all rounded-lg flex flex-col items-center"
                    >
                      <FiUser className="text-yellow-600 mb-2" size={20} />
                      <span className="text-sm text-yellow-700">Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "map" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Interactive Car Booking Map
              </h2>
              <p className="text-gray-600 mb-4">
                Select your pickup and destination points on the map or search
                for a location. Click anywhere on the map to set your
                destination.
              </p>

              <form onSubmit={searchLocation} className="mb-4 flex space-x-2">
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="Search for a location..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="border-t border-gray-100">
              <Map
                onLocationChange={handleLocationSelect}
                initialLocation={destination || currentLocation}
              />
            </div>

            <div className="p-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Selected Location:</h3>
                  <p className="text-gray-600">
                    {locationSearchQuery || "No location selected"}
                  </p>
                  {destination && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {destination.lat.toFixed(5)},{" "}
                      {destination.lng.toFixed(5)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 justify-end">
                  <button
                    onClick={saveLocationAsFavorite}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Save as Favorite
                  </button>
                  <button
                    onClick={handleBookCar}
                    disabled={!destination}
                    className={`px-4 py-2 rounded-lg ${
                      destination
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Book Car to This Location
                  </button>
                </div>
              </div>

              {favoriteLocations.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">
                    Quick Access - Favorite Locations:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {favoriteLocations.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => selectFavoriteLocation(location)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 flex items-center"
                      >
                        <FaMapMarkerAlt className="mr-1" size={12} />
                        {location.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Car Bookings</h2>
              <button
                onClick={() => navigate("/user/bookings")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book New Car
              </button>
            </div>
            {bookings.length > 0 ? (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="md:flex">
                      {booking.car?.images && booking.car.images.length > 0 && (
                        <div className="md:w-1/4 h-48 md:h-auto">
                          <img
                            src={
                              booking.car.images[0].startsWith("http")
                                ? booking.car.images[0]
                                : `http://localhost:4000${booking.car.images[0]}`
                            }
                            alt={booking.car.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 md:w-3/4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">
                              {booking.car?.name || "Car Booking"}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              Booking ID: #{booking._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Booking Period
                            </p>
                            <p className="font-medium">
                              {format(
                                new Date(booking.startDate),
                                "MMM dd, yyyy"
                              )}{" "}
                              -{" "}
                              {format(
                                new Date(booking.endDate),
                                "MMM dd, yyyy"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Amount
                            </p>
                            <p className="font-medium text-blue-700">
                              Rs. {booking.totalAmount}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{booking.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Contact</p>
                            <p className="font-medium">{booking.contact}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {booking.status === "pending" && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Cancel Booking
                            </button>
                          )}

                          {booking.status === "completed" && (
                            <button
                              onClick={() =>
                                navigate(`/user/review/${booking.car?._id}`)
                              }
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                            >
                              Write Review
                            </button>
                          )}

                         <Link to ="/user/mybooking">
                         <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            View Details
                          </button>
                         </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCalendar size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't made any car bookings yet.
                </p>
                <button
                  onClick={() => navigate("/user/bookings")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Book a Car Now
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-b from-blue-600 to-blue-800 p-8 text-white">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-blue-100">{user?.email}</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-blue-200 mb-3">
                    Account Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FiUser className="text-blue-200" />
                      <p>Member since {format(new Date(), "MMM yyyy")}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCar className="text-blue-200" />
                      <p>{stats.totalBookings} bookings</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 p-8">
                <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue={user?.phone}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-4">Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      onClick={() => handleTabChange("dashboard")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
