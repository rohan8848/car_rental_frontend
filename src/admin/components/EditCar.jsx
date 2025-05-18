import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const EditCar = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    transmission: "Manual",
    fuel: "Petrol",
    seats: "",
    price: "",
    mileage: "",
    description: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await api.get(`/cars/${id}`);
        const carData = response.data.car;
        setFormData({
          name: carData.name,
          brand: carData.brand,
          type: carData.type,
          transmission: carData.transmission,
          fuel: carData.fuel,
          seats: carData.seats,
          price: carData.price,
          mileage: carData.mileage,
          description: carData.description,
          images: carData.images,
        });
        setImagePreviews(carData.images);
      } catch (error) {
        console.error("Error fetching car:", error);
      }
    };

    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setFormData({
        ...formData,
        images: files,
      });
      setImagePreviews(
        Array.from(files).map((file) => URL.createObjectURL(file))
      );
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.seats < 2 || formData.seats > 10) {
      setError("Seats must be between 2 and 10.");
      return;
    }
    setError("");

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        Array.from(formData.images).forEach((file) => {
          formDataToSend.append("images", file);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await api.put(`/cars/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/admin/manage-cars");
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Car</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="Type"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <select
          name="transmission"
          value={formData.transmission}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>
        <select
          name="fuel"
          value={formData.fuel}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <input
          type="number"
          name="seats"
          value={formData.seats}
          onChange={handleChange}
          placeholder="Seats"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          name="mileage"
          value={formData.mileage}
          onChange={handleChange}
          placeholder="Mileage"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <input
          type="file"
          name="images"
          onChange={handleChange}
          multiple
          className="w-full px-4 py-2 border rounded-lg"
        />
        <div className="flex flex-wrap gap-4 mt-4">
          {imagePreviews.map((src, index) => (
            <img
              key={index}
              src={src}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Update Car
        </button>
      </form>
    </div>
  );
};

export default EditCar;
