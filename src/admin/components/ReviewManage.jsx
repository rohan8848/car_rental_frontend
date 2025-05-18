import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const ReviewManage = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("car");
  const [visibleReviews, setVisibleReviews] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchReviews();
      return;
    }

    try {
      const response = await api.get(
        `/reviews/search?term=${searchTerm}&type=${searchType}`
      );
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error searching reviews:", error);
      setReviews([]);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/reviews/${id}`);
      if (response.data.message === "Review deleted") {
        setReviews(reviews.filter((review) => review._id !== id));
        toast.success("Review deleted successfully");
      } else {
        console.error("Error deleting review:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleSeeMore = () => {
    setVisibleReviews((prev) => prev + 5);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Manage Reviews</h1>
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by Car Name or User Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg mr-2"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-4 py-2 border rounded-lg mr-2"
        >
          <option value="car">Car</option>
          <option value="user">User</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Search
        </button>
      </div>
      <ul className="space-y-4">
        {reviews.slice(0, visibleReviews).map((review) => (
          <li
            key={review._id}
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm"
          >
            <div>
              <p className="text-lg font-medium">
                {review.user?.name || "Unknown User"} -{" "}
                {review.car?.name || "Unknown Car"}
              </p>
              <p className="text-sm text-gray-600">Rating: {review.rating}</p>
              <p className="text-sm text-gray-600">Comment: {review.comment}</p>
            </div>
            <button
              onClick={() => handleDelete(review._id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {visibleReviews < reviews.length && (
        <button
          onClick={handleSeeMore}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          See More
        </button>
      )}
    </div>
  );
};

export default ReviewManage;
