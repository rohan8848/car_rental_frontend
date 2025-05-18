import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../pages/auth/AuthContext";
import { getFullImageUrl } from "../../utils/imageUtils";
import {
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiTruck,
  FiShield,
  FiSliders,
  FiHeart,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { TbManualGearbox, TbGasStation } from "react-icons/tb";

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const [carResponse, reviewsResponse] = await Promise.all([
          api.get(`/cars/${id}`),
          api.get(`/reviews/car/${id}`),
        ]);

        if (carResponse.data.success) {
          setCar(carResponse.data.car);
        }

        if (reviewsResponse.data && reviewsResponse.data.reviews) {
          setReviews(reviewsResponse.data.reviews);

          // Calculate average rating
          if (reviewsResponse.data.reviews.length > 0) {
            const sum = reviewsResponse.data.reviews.reduce(
              (acc, review) => acc + review.rating,
              0
            );
            setAverageRating(sum / reviewsResponse.data.reviews.length);
          }
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
        toast.error("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate(`/user/bookings/${id}`);
    } else {
      toast.warning("Please sign in first!");
      navigate("/auth/signin");
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.warning("Please sign in first!");
      navigate("/auth/signin");
      return;
    }

    try {
      await api.post("/wishlist", { carId: id });
      toast.success("Car added to wishlist!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add car to wishlist");
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? car.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === car.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderFeatures = () => {
    if (!car.description) return null;

    // Split description into bullet points if they contain dashes
    let features = [];
    if (car.description.includes("-")) {
      features = car.description
        .split("-")
        .filter((item) => item.trim() !== "");
    } else {
      features = [car.description];
    }

    return (
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3">Desciption:</h3>
        <ul className="list-none space-y-2 pl-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-4 h-4 mr-2  rounded-full mt-1"></span>
              <span className="text-gray-700">{feature.trim()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white shadow-lg rounded-xl">
          <h2 className="text-2xl font-bold text-red-500">Car Not Found</h2>
          <p className="mt-4 text-gray-600">
            Sorry, we couldn't find the car you're looking for.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex text-sm text-gray-500">
            <li
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </li>
            <li className="mx-2">/</li>
            <li
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => navigate("/user/cars")}
            >
              Cars
            </li>
            <li className="mx-2">/</li>
            <li className="text-blue-600 font-medium">{car.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl bg-white"
          >
            <div className="relative aspect-video overflow-hidden">
              {car.images && car.images.length > 0 ? (
                <img
                  src={getFullImageUrl(car.images[activeImageIndex])}
                  alt={`${car.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Navigation arrows */}
              {car.images && car.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-gray-800 hover:text-blue-600 transition-all"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-gray-800 hover:text-blue-600 transition-all"
                    aria-label="Next image"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {car.images
                  ? `${activeImageIndex + 1} / ${car.images.length}`
                  : "0 / 0"}
              </div>

              {/* Status badge */}
              <div
                className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-medium ${
                  car.status === "available"
                    ? "bg-green-500 text-white"
                    : car.status === "not-available"
                    ? "bg-red-500 text-white"
                    : "bg-yellow-500 text-white"
                }`}
              >
                {car.status?.replace("-", " ") || "Unknown"}
              </div>
            </div>

            {/* Thumbnail navigation */}
            {car.images && car.images.length > 1 && (
              <div className="flex overflow-x-auto p-4 gap-2 scrollbar-hide">
                {car.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      index === activeImageIndex
                        ? "border-blue-500 scale-105"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={getFullImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Car Details and Booking */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {car.name}
                  </h1>
                  <div className="flex items-center mt-2 text-gray-600">
                    <span className="font-medium text-gray-800 mr-3">
                      {car.brand}
                    </span>
                    <span className="inline-flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`${
                            i < Math.round(averageRating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          } w-5 h-5`}
                        />
                      ))}
                      <span className="ml-2 text-gray-700">
                        {averageRating
                          ? averageRating.toFixed(1)
                          : "No ratings"}
                      </span>
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    <span className="text-3xl text-blue-600">
                      {formatCurrency(car.price)}
                    </span>
                    <span className="text-sm font-normal text-gray-600">
                      /day
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl">
                  <TbManualGearbox className="text-blue-600 w-6 h-6 mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {car.transmission}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl">
                  <FiUsers className="text-blue-600 w-6 h-6 mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {car.seats} Seats
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl">
                  <TbGasStation className="text-blue-600 w-6 h-6 mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {car.fuel}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl">
                  <FiSliders className="text-blue-600 w-6 h-6 mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {car.type}
                  </div>
                </div>
              </div>

              {/* Replace description display with formatted features */}
              {renderFeatures()}

              <div className="mt-8 grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={car.status !== "available"}
                  onClick={handleBookNow}
                  className={`flex items-center justify-center py-3 px-6 rounded-xl text-white font-medium text-lg shadow-lg ${
                    car.status === "available"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FiCalendar className="mr-2" /> Book Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToWishlist}
                  className="flex items-center justify-center py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition duration-300"
                >
                  <FiHeart className="mr-2" /> Add to Wishlist
                </motion.button>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FiShield className="text-blue-600 w-5 h-5" />
                  <span className="text-gray-700">Comprehensive Insurance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiClock className="text-blue-600 w-5 h-5" />
                  <span className="text-gray-700">
                    24/7 Roadside Assistance
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiTruck className="text-blue-600 w-5 h-5" />
                  <span className="text-gray-700">
                    {car.mileage} KM/L Mileage
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiUsers className="text-blue-600 w-5 h-5" />
                  <span className="text-gray-700">Comfortable Seating</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white p-8 rounded-2xl shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h3>
            {isAuthenticated && (
              <button
                onClick={() => navigate(`/user/review/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No reviews yet. Be the first to review this car!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                        {review.user?.name
                          ? review.user.name[0].toUpperCase()
                          : "A"}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {review.user?.name || "Anonymous"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-blue-700 font-medium">
                        {review.rating}.0
                      </span>
                      <FiStar className="ml-1 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CarDetail;
