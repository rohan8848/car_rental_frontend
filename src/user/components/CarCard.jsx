import React from "react";
import { useNavigate } from "react-router-dom";
import { getFullImageUrl } from "../../utils/imageUtils";
import { useAuth } from "../../pages/auth/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

const CarCard = ({ car, onRemoveFromWishlist }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCardClick = () => {
    navigate(`/car/${car._id}`);
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning("Please sign in first!");
      navigate("/auth/signin");
      return;
    }

    try {
      await api.post("/wishlist", { carId: car._id });
      toast.success("Car added to wishlist!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add car to wishlist.");
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning("Please sign in first!");
      navigate("/auth/signin");
      return;
    }

    // Pass the car ID directly to the bookings route
    navigate(`/user/bookings/${car._id}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "available":
        return "text-green-600";
      case "not-available":
        return "text-red-600";
      case "out-of-service":
        return "text-yellow-600";
      case "available-soon":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer transform transition duration-300 hover:scale-105 mb-6"
      onClick={handleCardClick}
    >
      {car.images && car.images.length > 0 && (
        <div className="h-40 overflow-hidden rounded-lg">
          <img
            src={getFullImageUrl(car.images[0])}
            alt={car.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/300x160?text=No+Image";
            }}
          />
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">{car.name}</h2>
        <p className="text-gray-600 mb-1">Brand: {car.brand}</p>
        <p className="text-gray-600 mb-1">Transmission: {car.transmission}</p>
        <p className="text-gray-600 mb-1">{car.seats} seats</p>
        <p className="text-gray-600 mb-1">Rs.{car.price} per day</p>
        <p
          className={`text-sm font-semibold mb-4 ${getStatusClass(car.status)}`}
        >
          {car.status ? car.status.replace("-", " ") : "Unknown"}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            className={`px-4 py-2 rounded-md ${
              car.status === "available"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
            onClick={handleBookNow}
            disabled={car.status !== "available"}
          >
            Book Now
          </button>
          {onRemoveFromWishlist ? (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromWishlist();
              }}
            >
              Remove from Wishlist
            </button>
          ) : (
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
              onClick={handleAddToWishlist}
            >
              Add to Wishlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
