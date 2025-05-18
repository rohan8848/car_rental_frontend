import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiStar,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../../services/api";
import { getFullImageUrl } from "../../utils/imageUtils";

const ManageClientReviews = () => {
  const [clientReviews, setClientReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    review: "",
    rating: 5,
    logo: null,
    logoPreview: null,
  });

  useEffect(() => {
    fetchClientReviews();
  }, []);

  const fetchClientReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/client-reviews");
      if (response.data.success) {
        setClientReviews(response.data.data);
      } else {
        toast.error("Failed to load client reviews");
      }
    } catch (error) {
      console.error("Error fetching client reviews:", error);
      toast.error("Error loading client reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files.length) {
      const file = files[0];
      console.log("File selected:", file.name, "size:", file.size);
      setFormData({
        ...formData,
        logo: file,
        logoPreview: URL.createObjectURL(file),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      review: "",
      rating: 5,
      logo: null,
      logoPreview: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.review) {
      toast.error("Name and review are required");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("review", formData.review);
      submitData.append("rating", formData.rating);

      // Check if there's a file to upload
      if (formData.logo instanceof File) {
        console.log("Appending file to form data:", formData.logo.name);
        submitData.append("logo", formData.logo);
      }

      let response;

      // Add console logs for debugging
      console.log("FormData entries:");
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }

      if (editingId) {
        // Update existing review
        response = await api.put(`/client-reviews/${editingId}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          setClientReviews(
            clientReviews.map((review) =>
              review._id === editingId ? response.data.data : review
            )
          );
          toast.success("Client review updated successfully");
        }
      } else {
        // Add new review
        response = await api.post("/client-reviews", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          setClientReviews([response.data.data, ...clientReviews]);
          toast.success("Client review added successfully");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error saving client review:", error);
      toast.error(
        error.response?.data?.message || "Failed to save client review"
      );
    }
  };

  const handleEdit = (review) => {
    setFormData({
      name: review.name,
      review: review.review,
      rating: review.rating,
      logo: null,
      logoPreview: getFullImageUrl(review.logo),
    });
    setEditingId(review._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await api.put(`/client-reviews/${id}/toggle`);
      if (response.data.success) {
        setClientReviews(
          clientReviews.map((review) =>
            review._id === id ? response.data.data : review
          )
        );
        toast.success(
          `Review ${currentStatus ? "hidden" : "visible"} on website`
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error toggling client review status:", error);
      toast.error("Failed to update review status");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client review?"
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/client-reviews/${id}`);
      if (response.data.success) {
        setClientReviews(clientReviews.filter((review) => review._id !== id));
        toast.success("Client review deleted successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting client review:", error);
      toast.error("Failed to delete client review");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Client Testimonials</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchClientReviews}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 ${
              showForm ? "bg-gray-500" : "bg-blue-500"
            } text-white rounded-lg hover:${
              showForm ? "bg-gray-600" : "bg-blue-600"
            } flex items-center`}
          >
            {showForm ? (
              <>Cancel</>
            ) : (
              <>
                <FiPlus className="mr-2" />
                Add New Testimonial
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingId
              ? "Edit Client Testimonial"
              : "Add New Client Testimonial"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl ${
                        formData.rating >= star
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Logo
              </label>
              <input
                type="file"
                name="logo"
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                accept="image/*"
              />
              {formData.logoPreview && (
                <div className="mt-2">
                  <img
                    src={formData.logoPreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                </div>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Testimonial
              </label>
              <textarea
                name="review"
                value={formData.review}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingId ? "Update Testimonial" : "Add Testimonial"}
              </button>
            </div>
          </form>
        </div>
      )}

      {clientReviews.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No client testimonials found</p>
          <p className="text-gray-400 mt-2">
            Add testimonials to showcase client feedback
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientReviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-lg shadow overflow-hidden border ${
                review.isActive ? "border-green-200" : "border-red-200"
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <img
                      src={getFullImageUrl(review.logo)}
                      alt={review.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg";
                      }}
                    />
                    <h3 className="font-semibold text-gray-800">
                      {review.name}
                    </h3>
                  </div>
                  <div>
                    {review.isActive ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex text-yellow-500 mb-1">
                    {[...Array(review.rating)].map((_, index) => (
                      <FiStar key={index} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">{review.review}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() =>
                      handleToggleActive(review._id, review.isActive)
                    }
                    className={`p-2 ${
                      review.isActive
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-600"
                    } rounded hover:${
                      review.isActive ? "bg-gray-200" : "bg-green-200"
                    }`}
                    title={
                      review.isActive ? "Hide from website" : "Show on website"
                    }
                  >
                    {review.isActive ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageClientReviews;
