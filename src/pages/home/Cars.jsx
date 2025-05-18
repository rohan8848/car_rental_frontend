import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "/src/pages/auth/AuthContext";
import api from "/src/services/api";
import { getFullImageUrl } from "/src/utils/imageUtils";
import { toast } from "react-toastify";

const Cars = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [carData, setCarData] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      easing: "ease-in-out", // Smooth easing for animations
      once: false, // Ensures animations run only once on scroll
    });

    const fetchCars = async () => {
      try {
        const response = await api.get("/cars");
        setCarData(response.data.data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };

    fetchCars();
  }, []);

  const handleBookNow = (car) => {
    if (isAuthenticated) {
      navigate("/user/bookings");
    } else {
      localStorage.setItem("selectedCar", JSON.stringify(car));
      toast.warning("Please sign in first!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/auth/signin");
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-28"
      id="cars"
    >
      <div className="max-w-7xl mx-auto px-4 xl:px-0">
        <h2
          className="text-4xl font-extrabold text-center mb-12 text-yellow-400"
          data-aos="fade-up"
        >
          Available Cars for Booking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {carData.map((car, index) => (
            <div
              key={car._id}
              data-aos="fade-up"
              data-aos-delay={index * 100} // Staggered animation for each card
              className="bg-neutral-800 rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
            >
              <img
                src={getFullImageUrl(car.images[0])}
                alt={car.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-yellow-400 mb-2">
                  {car.name}
                </h3>
                <p className="text-lg font-medium text-neutral-400 mb-4">
                  Rs.{car.price}/day
                </p>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg w-full transition duration-300"
                  onClick={() => handleBookNow(car)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cars;
