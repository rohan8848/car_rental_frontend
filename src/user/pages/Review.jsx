import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

const Review = () => {
  // Ensure carId does NOT include an extra "car" segment.
  let { carId } = useParams();
  // If the carId includes "car/", remove it.
  if (carId.startsWith("car/")) {
    carId = carId.replace("car/", "");
  }

  const [formData, setFormData] = useState({
    rating: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(null); // Track if user can review

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews/car/${carId}`);
        setReviews(response.data.reviews);

        // Check if user can review this car
        const eligibilityCheck = await api.get(
          `/reviews/car/${carId}/can-review`
        );
        setCanReview(eligibilityCheck.data.canReview);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [carId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(
        `/reviews/car/${carId}/reviews`,
        formData
      );
      if (response.data.message === "Review added") {
        toast.success("Your review was submitted successfully!");
        setReviews([...reviews, response.data.review]);
        setFormData({ rating: "", comment: "" });
      }
    } catch (error) {
      console.error("Error submitting review:", error);

      // Display specific error message from API if available
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit review. Please try again later.";

      toast.error(errorMessage);

      // If specific message about booking status, provide more guidance
      if (
        errorMessage.includes(
          "You can only review cars you have booked and completed"
        )
      ) {
        toast.info(
          "You need to complete a booking for this car before leaving a review."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Write a Review
          </h2>

          {canReview === false ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-700">
                You can only review cars you have booked and completed. Please
                book and complete a trip with this car first.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              {/* Comment Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Comment
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          )}
        </div>
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-600">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border p-4 rounded-md shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      {review.user?.name || "Anonymous"}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">
                      {"★".repeat(review.rating)}
                    </span>
                    <span className="text-gray-400">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
