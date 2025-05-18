import React, { useState, useEffect } from "react";
import api from "../../services/api";
import CarCard from "../components/CarCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../pages/auth/AuthContext";
import { toast } from "react-toastify";

const Car = () => {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    type: "",
    transmission: "",
    fuel: "",
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await api.get("/cars");
        if (Array.isArray(response.data.data)) {
          setCars(response.data.data);
        } else {
          setCars([]);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
        setCars([]);
      }
    };

    fetchCars();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

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

  const filteredCars = cars.filter((car) => {
    return (
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.brand ? car.brand === filters.brand : true) &&
      (filters.type ? car.type === filters.type : true) &&
      (filters.transmission
        ? car.transmission === filters.transmission
        : true) &&
      (filters.fuel ? car.fuel === filters.fuel : true)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Available Cars</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by car name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded-md w-full mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Brands</option>
            <option value="Tesla">Tesla</option>
            <option value="BMW">BMW</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="Audi">Audi</option>
            {/* Add more brands as needed */}
          </select>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Types</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            {/* Add more types as needed */}
          </select>
          <select
            name="transmission"
            value={filters.transmission}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Transmissions</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
          <select
            name="fuel"
            value={filters.fuel}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Fuels</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCars.map((car) => (
          <CarCard
            key={car._id}
            car={car}
            onBookNow={() => handleBookNow(car)}
          />
        ))}
      </div>
    </div>
  );
};

export default Car;
