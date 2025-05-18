import React, { useState, useEffect } from "react";
import api from "../../services/api";
import CarCard from "../components/CarCard";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get("/wishlist");
        setWishlist(response.data.wishlist.map((item) => item.car));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (carId) => {
    try {
      await api.delete(`/wishlist/${carId}`);
      setWishlist(wishlist.filter((car) => car._id !== carId));
      toast.success("Car removed from wishlist!");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove car from wishlist.");
    }
  };

  const handleCardClick = (carId) => {
    navigate(`/car/${carId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-6">
            My Wishlist
          </h2>
          {wishlist.length === 0 ? (
            <p className="text-center text-gray-600">Your wishlist is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((car) => (
                <div key={car._id} onClick={() => handleCardClick(car._id)}>
                  <CarCard
                    car={car}
                    onRemoveFromWishlist={() =>
                      handleRemoveFromWishlist(car._id)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
