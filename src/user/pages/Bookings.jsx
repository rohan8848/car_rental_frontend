import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { useAuth } from "../../pages/auth/AuthContext";
import api from "../../services/api";
import Map from "../../components/Map";
import { getFullImageUrl } from "../../utils/imageUtils";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";

const officeLocation = { lat: 27.7615, lng: 85.3365 };

const Bookings = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    address: "",
    email: user?.email || "",
    contact: user?.phone || "",
    startDate: null,
    endDate: null,
    location: { lat: 27.7615, lng: 85.3365 },
    pickupCoords: null,
    dropoffCoords: null,
    pickupTime: "10:00",
    dropoffTime: "10:00",
    needsDriver: false, // Added driver option
  });
  const [loading, setLoading] = useState(false);
  const [loadingCar, setLoadingCar] = useState(true);
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const { carId } = useParams();
  const mapContainerRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [locationType, setLocationType] = useState("same"); // "same" or "different"

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        contact: user.phone || "",
      }));
    }

    // Check for saved location from dashboard
    const savedDestination = sessionStorage.getItem("selectedDestination");
    const savedAddress = sessionStorage.getItem("locationSearchQuery");

    if (savedDestination) {
      try {
        const location = JSON.parse(savedDestination);
        setFormData((prev) => ({
          ...prev,
          location: location,
          address:
            savedAddress ||
            `Location at ${location.lat.toFixed(4)}, ${location.lng.toFixed(
              4
            )}`,
        }));

        // Set the location for both pickup and dropoff
        setPickupLocation(location);
        setDropoffLocation(location);

        // Clear session storage after using it
        sessionStorage.removeItem("selectedDestination");
        sessionStorage.removeItem("locationSearchQuery");

        // Show confirmation toast with the location name
        toast.success(`Selected location: ${savedAddress}`, {
          icon: "📍",
          position: "top-center",
          autoClose: 2000,
        });
      } catch (error) {
        console.error("Error parsing saved destination:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        if (carId) {
          const response = await api.get(`/cars/${carId}`);
          setSelectedCar(response.data.car);
          toast.success(`${response.data.car.name} selected for booking!`, {
            icon: "🚗",
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          const response = await api.get(`/cars`);
          const available = response.data.data.filter(
            (car) => car.status === "available"
          );
          setAvailableCars(available);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
        toast.error("Car details not loaded. Please try again.");
      } finally {
        setLoadingCar(false);
      }
    };
    fetchCar();
  }, [carId]);

  useEffect(() => {
    const price = calculatePrice();
    setTotalPrice(price);
  }, [
    formData.startDate,
    formData.endDate,
    formData.pickupTime,
    formData.needsDriver,
    selectedCar,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "address" && value.length > 3) {
      const mockSuggestions = [`${value} `];
      setAddressSuggestions(mockSuggestions);
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleCarSelect = (option) => {
    setSelectedCar(option.value);
    toast.success(`${option.value.name} selected!`, {
      icon: "🚙",
      position: "top-center",
      autoClose: 1500,
    });
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!selectedCar) {
        toast.error("Please select a car for booking.");
        return;
      }
      if (!formData.startDate || !formData.endDate) {
        toast.error("Please select pickup and return dates.");
        return;
      }
    }

    setAnimating(true);
    setTimeout(() => {
      setStep(step + 1);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setAnimating(true);
    setTimeout(() => {
      setStep(step - 1);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCar) {
      toast.error("Car details not loaded. Please try again.");
      return;
    }

    const driverDays = Math.ceil(
      (formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)
    );
    const driverPrice = formData.needsDriver ? 1000 * driverDays : 0;

    const payload = {
      ...formData,
      car: selectedCar._id,
      totalAmount: totalPrice,
      address: formData.address || "",
      email: formData.email || user.email,
      contact: formData.contact || user.phone,
      user: user._id,
      needsDriver: formData.needsDriver,
      driverPrice: driverPrice,
    };

    // Handle different location types
    if (locationType === "same") {
      payload.location = formData.location;
    } else {
      payload.pickupCoords = formData.pickupCoords || pickupLocation;
      payload.dropoffCoords = formData.dropoffCoords || dropoffLocation;
      payload.pickupAddress = formData.pickupAddress;
      payload.dropoffAddress = formData.dropoffAddress;
    }

    if (
      !selectedCar ||
      !formData.startDate ||
      !formData.endDate ||
      !totalPrice
    ) {
      toast.error("Some required fields are missing");
      return;
    }

    // For same location type, verify location exists
    if (
      locationType === "same" &&
      (!formData.location?.lat || !formData.location?.lng)
    ) {
      toast.error("Please select a location");
      return;
    }

    // For different location type, verify both locations exist
    if (
      locationType === "different" &&
      (!pickupLocation?.lat ||
        !pickupLocation?.lng ||
        !dropoffLocation?.lat ||
        !dropoffLocation?.lng)
    ) {
      toast.error("Please select both pickup and dropoff locations");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/bookings", payload);
      if (response.data.success) {
        import("canvas-confetti").then((confetti) => {
          confetti.default({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
          });

          setTimeout(() => {
            navigate(`/user/payment?bookingId=${response.data.booking._id}`);
          }, 1000);
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!formData.startDate || !formData.endDate || !selectedCar) return 0;
    const days = Math.ceil(
      (formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)
    );
    const basePrice = selectedCar.price;
    const driverPrice = formData.needsDriver ? 1000 : 0; // Driver costs Rs.1000 per day
    return Math.round((basePrice + driverPrice) * days);
  };

  const handleLocationChange = (loc, locationName) => {
    if (locationType === "same") {
      setPickupLocation(loc);
      setDropoffLocation(loc);
      setFormData((prev) => ({
        ...prev,
        location: loc,
        address:
          locationName ||
          `Location at ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
      }));
    } else {
      // In separate location mode, check which one we're editing
      if (step === 2) {
        setPickupLocation(loc);
        setFormData((prev) => ({
          ...prev,
          pickupCoords: loc,
          pickupAddress:
            locationName ||
            `Pickup at ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
        }));
      } else if (step === 3) {
        setDropoffLocation(loc);
        setFormData((prev) => ({
          ...prev,
          dropoffCoords: loc,
          dropoffAddress:
            locationName ||
            `Dropoff at ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
        }));
      }
    }
  };

  const getDirectionsUrl = () => {
    const { lat, lng } = formData.location;
    return `https://www.google.com/maps/dir/?api=1&origin=${officeLocation.lat},${officeLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
  };

  const carOptions = availableCars.map((car) => ({
    label: (
      <div className="flex items-center">
        <div className="w-16 h-12 overflow-hidden rounded-md mr-3">
          <img
            src={getFullImageUrl(car.images[0])}
            alt={car.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="font-medium">{car.name}</span>
          <span className="text-xs text-gray-500 block">
            Rs.{car.price}/day • {car.transmission}
          </span>
        </div>
      </div>
    ),
    value: car,
  }));

  const selectStyles = {
    control: (base) => ({
      ...base,
      padding: "6px",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      borderColor: "#e2e8f0",
      "&:hover": {
        borderColor: "#cbd5e0",
      },
    }),
    option: (base, state) => ({
      ...base,
      padding: "12px",
      backgroundColor: state.isFocused ? "#EBF4FF" : "white",
      "&:hover": {
        backgroundColor: "#EBF4FF",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }),
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 },
    },
  };

  const steps = [
    { number: 1, title: "Select Car & Dates" },
    { number: 2, title: "Choose Location" },
    { number: 3, title: "Confirm & Pay" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <div className="flex justify-between items-center w-full relative">
            <div className="absolute top-1/2 h-1 bg-gray-300 w-full -z-10"></div>
            <div
              className="absolute top-1/2 h-1 bg-blue-400 -z-5 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((s) => (
              <motion.div
                key={s.number}
                className={`flex flex-col items-center z-10 ${
                  step >= s.number ? "text-white" : "text-gray-400"
                }`}
                animate={step >= s.number ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold mb-2 
                            shadow-lg 
                            ${
                              step > s.number
                                ? "bg-green-500 text-white"
                                : step === s.number
                                ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                >
                  {step > s.number ? <FiCheck size={20} /> : s.number}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {s.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial="initial"
            animate={animating ? "exit" : "animate"}
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-10">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {step === 1 && "Choose Your Perfect Ride"}
                {step === 2 && "Select Your Location"}
                {step === 3 && "Review & Confirm"}
              </h2>

              {loadingCar ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-lg text-gray-600">
                    Loading car details...
                  </p>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <motion.form
                      onSubmit={handleNext}
                      className="space-y-8"
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="mb-8">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          <FaCar className="inline-block mr-2" size={20} />
                          Select Your Car
                        </label>

                        {carId && selectedCar ? (
                          <motion.div
                            className="border border-blue-200 p-4 rounded-2xl bg-blue-50 relative overflow-hidden"
                            whileHover="hover"
                            variants={cardVariants}
                          >
                            <span className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
                              Selected
                            </span>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <div className="w-full sm:w-1/3 h-48 overflow-hidden rounded-lg shadow-md">
                                <img
                                  src={getFullImageUrl(selectedCar.images[0])}
                                  alt={selectedCar.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                  {selectedCar.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex items-center">
                                    <span className="text-gray-600 font-medium">
                                      Brand:
                                    </span>
                                    <span className="ml-2">
                                      {selectedCar.brand}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-gray-600 font-medium">
                                      Type:
                                    </span>
                                    <span className="ml-2">
                                      {selectedCar.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-gray-600 font-medium">
                                      Transmission:
                                    </span>
                                    <span className="ml-2">
                                      {selectedCar.transmission}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-gray-600 font-medium">
                                      Fuel:
                                    </span>
                                    <span className="ml-2">
                                      {selectedCar.fuel}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-3 text-xl font-bold text-blue-600">
                                  Rs.{selectedCar.price} / day
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <Select
                            options={carOptions}
                            onChange={handleCarSelect}
                            placeholder="Choose a car..."
                            className="car-select-container"
                            styles={selectStyles}
                            isSearchable
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Address
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="address"
                              placeholder="Enter your address"
                              value={formData.address}
                              onChange={handleChange}
                              className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              required
                            />
                            {addressSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                                {addressSuggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        address: suggestion,
                                      });
                                      setAddressSuggestions([]);
                                    }}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Contact
                          </label>
                          <input
                            type="tel"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            <FiCalendar
                              className="inline-block mr-2"
                              size={20}
                            />
                            Start Date
                          </label>
                          <DatePicker
                            selected={formData.startDate}
                            onChange={(date) =>
                              setFormData({ ...formData, startDate: date })
                            }
                            selectsStart
                            startDate={formData.startDate}
                            endDate={formData.endDate}
                            minDate={new Date()}
                            dateFormat="MMMM d, yyyy"
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            <FiClock className="inline-block mr-2" size={20} />
                            Pickup Time
                          </label>
                          <select
                            name="pickupTime"
                            value={formData.pickupTime}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            {timeSlots.map((time) => (
                              <option key={`pickup-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            <FiCalendar
                              className="inline-block mr-2"
                              size={20}
                            />
                            End Date
                          </label>
                          <DatePicker
                            selected={formData.endDate}
                            onChange={(date) =>
                              setFormData({ ...formData, endDate: date })
                            }
                            selectsEnd
                            startDate={formData.startDate}
                            endDate={formData.endDate}
                            minDate={formData.startDate || new Date()}
                            dateFormat="MMMM d, yyyy"
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            <FiClock className="inline-block mr-2" size={20} />
                            Return Time
                          </label>
                          <select
                            name="dropoffTime"
                            value={formData.dropoffTime}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            {timeSlots.map((time) => (
                              <option key={`dropoff-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="flex items-center text-lg font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.needsDriver}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                needsDriver: e.target.checked,
                              })
                            }
                            className="mr-3 h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                          />
                          <span>Need a Driver? (Rs.1000 per day)</span>
                        </label>
                        <p className="mt-2 text-sm text-gray-500 ml-8">
                          Our professional drivers are well-trained and familiar
                          with all routes.
                        </p>
                      </div>

                      {totalPrice > 0 && (
                        <motion.div
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Estimated Price
                          </h3>
                          <p className="text-3xl font-bold text-blue-600">
                            Rs. {totalPrice}
                          </p>

                          {formData.startDate && formData.endDate && (
                            <p className="text-sm text-gray-600 mt-2">
                              For{" "}
                              {Math.ceil(
                                (formData.endDate - formData.startDate) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days
                              {formData.needsDriver && (
                                <span className="ml-2 font-medium">
                                  (Including driver)
                                </span>
                              )}
                            </p>
                          )}
                        </motion.div>
                      )}

                      <div className="flex justify-end">
                        <motion.button
                          type="submit"
                          className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Next
                          <FiArrowRight className="ml-2" size={20} />
                        </motion.button>
                      </div>
                    </motion.form>
                  )}

                  {step === 2 && (
                    <motion.form
                      className="space-y-6"
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="mb-4">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="same-location"
                              name="locationType"
                              value="same"
                              checked={locationType === "same"}
                              onChange={() => setLocationType("same")}
                              className="mr-2"
                            />
                            <label
                              htmlFor="same-location"
                              className="text-lg font-medium text-gray-700"
                            >
                              Same pickup & dropoff location
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="diff-location"
                              name="locationType"
                              value="different"
                              checked={locationType === "different"}
                              onChange={() => setLocationType("different")}
                              className="mr-2"
                            />
                            <label
                              htmlFor="diff-location"
                              className="text-lg font-medium text-gray-700"
                            >
                              Different pickup & dropoff locations
                            </label>
                          </div>
                        </div>

                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          <FiMapPin className="inline-block mr-2" size={20} />
                          {locationType === "same"
                            ? "Choose Your Location"
                            : "Choose Pickup Location"}
                        </label>
                        <p className="text-gray-600 mb-4">
                          Click on the map to select your{" "}
                          {locationType === "same"
                            ? "preferred pickup/dropoff"
                            : "pickup"}{" "}
                          location
                        </p>

                        <div
                          className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[400px]"
                          ref={mapContainerRef}
                        >
                          <Map
                            onLocationChange={handleLocationChange}
                            initialLocation={pickupLocation}
                          />
                        </div>

                        <div className="mt-4 flex space-x-4">
                          {pickupLocation && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${pickupLocation.lat},${pickupLocation.lng}&travelmode=driving`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                            >
                              <FiMapPin className="mr-2" />
                              Get Directions to Pickup
                            </a>
                          )}
                        </div>
                      </div>

                      {locationType === "different" && (
                        <div className="mb-4 mt-6 pt-4 border-t border-gray-200">
                          <label className="block text-lg font-semibold text-gray-700 mb-3">
                            <FiMapPin className="inline-block mr-2" size={20} />
                            Choose Dropoff Location
                          </label>
                          <p className="text-gray-600 mb-4">
                            Click on the map to select your dropoff location
                          </p>

                          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[400px]">
                            <Map
                              onLocationChange={(loc, name) => {
                                setDropoffLocation(loc);
                                setFormData((prev) => ({
                                  ...prev,
                                  dropoffCoords: loc,
                                  dropoffAddress:
                                    name ||
                                    `Dropoff at ${loc.lat.toFixed(
                                      4
                                    )}, ${loc.lng.toFixed(4)}`,
                                }));
                              }}
                              initialLocation={dropoffLocation}
                            />
                          </div>

                          <div className="mt-4 flex space-x-4">
                            {dropoffLocation && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${dropoffLocation.lat},${dropoffLocation.lng}&travelmode=driving`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                              >
                                <FiMapPin className="mr-2" />
                                Get Directions to Dropoff
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-8">
                        <motion.button
                          onClick={handlePrevious}
                          className="flex items-center px-8 py-4 bg-gray-200 text-gray-700 rounded-xl shadow-md text-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiArrowLeft className="mr-2" size={20} />
                          Previous
                        </motion.button>

                        <motion.button
                          onClick={handleNext}
                          className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Next
                          <FiArrowRight className="ml-2" size={20} />
                        </motion.button>
                      </div>
                    </motion.form>
                  )}

                  {step === 3 && (
                    <motion.form
                      onSubmit={handleSubmit}
                      className="space-y-8"
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                          Booking Summary
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                              Car Details
                            </h4>
                            {selectedCar && (
                              <div className="flex items-start space-x-4">
                                <div className="w-24 h-24 rounded-lg overflow-hidden">
                                  <img
                                    src={getFullImageUrl(selectedCar.images[0])}
                                    alt={selectedCar.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h5 className="text-xl font-bold">
                                    {selectedCar.name}
                                  </h5>
                                  <p className="text-gray-600">
                                    {selectedCar.brand} • {selectedCar.type}
                                  </p>
                                  <p className="text-gray-600">
                                    {selectedCar.transmission} •{" "}
                                    {selectedCar.fuel}
                                  </p>
                                  <p className="text-blue-600 font-bold mt-1">
                                    Rs. {selectedCar.price} / day
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                              Booking Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Pickup Date:
                                </span>
                                <span className="font-medium">
                                  {formData.startDate?.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Pickup Time:
                                </span>
                                <span className="font-medium">
                                  {formData.pickupTime}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Return Date:
                                </span>
                                <span className="font-medium">
                                  {formData.endDate?.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Return Time:
                                </span>
                                <span className="font-medium">
                                  {formData.dropoffTime}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">
                                  {Math.ceil(
                                    (formData.endDate - formData.startDate) /
                                      (1000 * 60 * 60 * 24)
                                  )}{" "}
                                  days
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                              Contact Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">
                                  {formData.email}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Contact:</span>
                                <span className="font-medium">
                                  {formData.contact}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Address:</span>
                                <span className="font-medium">
                                  {formData.address}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-xl shadow-md">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                              Price Breakdown
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Daily Rate:
                                </span>
                                <span className="font-medium">
                                  Rs. {selectedCar?.price || 0}
                                </span>
                              </div>
                              {formData.needsDriver && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Driver Fee:
                                  </span>
                                  <span className="font-medium">
                                    Rs. 1000 / day
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Number of Days:
                                </span>
                                <span className="font-medium">
                                  {Math.ceil(
                                    (formData.endDate - formData.startDate) /
                                      (1000 * 60 * 60 * 24)
                                  )}
                                </span>
                              </div>
                              <div className="border-t pt-2 flex justify-between">
                                <span className="text-gray-800 font-bold">
                                  Total Amount:
                                </span>
                                <span className="text-xl font-bold text-blue-600">
                                  Rs. {totalPrice}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                          <h5 className="text-sm font-bold text-yellow-800 mb-2">
                            Cancellation Policy
                          </h5>
                          <p className="text-sm text-yellow-800">
                            Free cancellation up to 24 hours before pickup time.
                            After that, a cancellation fee may apply.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <motion.button
                          type="button"
                          onClick={handlePrevious}
                          className="flex items-center px-8 py-4 bg-gray-200 text-gray-700 rounded-xl shadow-md text-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiArrowLeft className="mr-2" size={20} />
                          Previous
                        </motion.button>

                        <motion.button
                          type="submit"
                          disabled={loading}
                          className={`flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl shadow-lg text-xl font-semibold transition-all duration-300 ${
                            loading
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:from-green-600 hover:to-blue-600"
                          }`}
                          whileHover={loading ? {} : { scale: 1.05 }}
                          whileTap={loading ? {} : { scale: 0.95 }}
                        >
                          {loading ? (
                            <>
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiCreditCard className="mr-2" size={20} />
                              Confirm & Pay
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Bookings;
