import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { getFullImageUrl } from "../../utils/imageUtils";
import { FiSearch, FiPlus } from "react-icons/fi";

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cars/${id}`);
      setCars(cars.filter((car) => car._id !== id));
      toast.success("Car deleted successfully");
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Error deleting car");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/cars/${id}/status`, { status });
      setCars(cars.map((car) => (car._id === id ? { ...car, status } : car)));
      toast.success("Car status updated successfully");
    } catch (error) {
      console.error("Error updating car status:", error);
      toast.error("Error updating car status");
    }
  };

  // Filter cars based on search term
  const filteredCars = cars.filter((car) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (car.name && car.name.toLowerCase().includes(searchLower)) ||
      (car.brand && car.brand.toLowerCase().includes(searchLower)) ||
      (car.type && car.type.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Cars</h1>
        <Link
          to="/admin/add-car"
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="mr-2" /> Add Car
        </Link>
      </div>

      {/* Search input */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search cars by name, brand, or type..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCars.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {cars.length === 0 ? "No cars found" : "No cars match your search"}
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Image</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Brand</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.map((car) => (
              <tr key={car._id}>
                <td className="py-2 px-4 border-b">
                  {car.images.length > 0 ? (
                    <div className="w-20 h-16 overflow-hidden rounded-md">
                      <img
                        src={getFullImageUrl(car.images[0])}
                        alt={car.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-4 border-b">{car.name}</td>
                <td className="py-2 px-4 border-b">{car.brand}</td>
                <td className="py-2 px-4 border-b">{car.type}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={car.status}
                    onChange={(e) =>
                      handleStatusChange(car._id, e.target.value)
                    }
                    className="px-2 py-1 border rounded-lg"
                  >
                    <option value="available">Available</option>
                    <option value="not-available">Not Available</option>
                    <option value="out-of-service">Out of Service</option>
                    <option value="available-soon">Available Soon</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b flex flex-wrap gap-2">
                  <Link
                    to={`/admin/edit-car/${car._id}`}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(car._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageCars;
