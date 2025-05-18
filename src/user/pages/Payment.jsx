import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  FiCreditCard,
  FiDollarSign,
  FiArrowLeft,
  FiAlertTriangle,
} from "react-icons/fi";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD
  const [khaltiError, setKhaltiError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        if (response.data.success) {
          setBooking(response.data.booking);
        } else {
          toast.error("Booking details not found.");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("Failed to fetch booking details.");
      }
    };
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    // Reset any previous Khalti errors when changing payment method
    setKhaltiError(null);
  };

  const handleCheckout = () => {
    if (paymentMethod === "khalti") {
      // Try the newer API first, fall back to old method if it fails
      initiateNewKhaltiPayment();
    } else {
      // Proceed with COD checkout
      processCodePayment();
    }
  };

  const processCodePayment = async () => {
    setLoading(true);
    try {
      await api.put(`/bookings/${bookingId}/status`, {
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "pending",
      });
      toast.success("Order placed successfully! Pay on delivery.");
      navigate("/user/mybooking");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to process your booking.");
    } finally {
      setLoading(false);
    }
  };

  const initiateNewKhaltiPayment = async () => {
    setLoading(true);
    setKhaltiError(null);
    try {
      console.log("Initiating Khalti payment for booking:", bookingId);

      // Use the specialized payment API method
      const response = await api.payment.initiateKhaltiPayment({
        bookingId: bookingId,
        amount: booking.totalAmount,
        returnUrl: `${window.location.origin}/user/mybooking`,
      });

      console.log("Khalti payment initiation response:", response.data);

      if (response.data.success && response.data.data.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = response.data.data.payment_url;
      } else {
        toast.error(
          "Failed to initiate payment. Please try again or use cash on delivery."
        );
        setLoading(false);
        setKhaltiError("Payment gateway returned an invalid response");
      }
    } catch (error) {
      console.error("Khalti payment initiation error:", error);

      // Show appropriate error message based on the error
      const errorMessage =
        error.response?.data?.message ||
        "Unable to connect to payment gateway. Please try again or use cash on delivery.";

      toast.error(errorMessage);
      setLoading(false);
      setKhaltiError(errorMessage);

      // Offer to fall back to COD automatically
      setTimeout(() => {
        setPaymentMethod("cod");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Complete Your Payment
        </h2>

        {booking ? (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-center mb-1 text-gray-700">
              Booking ID: <span className="font-medium">{bookingId}</span>
            </p>
            <p className="text-center text-lg font-semibold text-blue-700 mb-1">
              Rs. {booking.totalAmount}
            </p>
            <p className="text-center text-sm text-gray-600">
              {booking.car?.name} •{" "}
              {Math.ceil(
                (new Date(booking.endDate) - new Date(booking.startDate)) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}

        {khaltiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <FiAlertTriangle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800">
                Payment Gateway Error
              </h4>
              <p className="text-sm text-red-600 mt-1">{khaltiError}</p>
              <p className="text-sm text-red-600 mt-2">
                Please try the cash on delivery option instead.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Select Payment Method
          </h3>

          <div className="space-y-3">
            <div
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("cod")}
            >
              <input
                type="radio"
                id="cod"
                name="payment-method"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={handlePaymentMethodChange}
                className="h-5 w-5 text-blue-600"
              />
              <label
                htmlFor="cod"
                className="ml-3 block text-gray-700 cursor-pointer w-full"
              >
                <div className="flex items-center">
                  <FiDollarSign className="text-blue-600 mr-2" />
                  <span>Cash on Delivery</span>
                </div>
              </label>
            </div>

            <div
              className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                khaltiError ? "opacity-50" : ""
              }`}
              onClick={() => !khaltiError && setPaymentMethod("khalti")}
            >
              <input
                type="radio"
                id="khalti"
                name="payment-method"
                value="khalti"
                checked={paymentMethod === "khalti"}
                onChange={handlePaymentMethodChange}
                disabled={khaltiError}
                className="h-5 w-5 text-purple-600"
              />
              <label
                htmlFor="khalti"
                className={`ml-3 flex items-center cursor-pointer w-full ${
                  khaltiError ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="text-purple-700 font-medium mr-2">Khalti</span>
                <img
                  src="https://khalti.com/static/khalti-logo.svg"
                  alt="Khalti"
                  className="h-6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.seeklogo.com/logo-png/33/1/khalti-logo-png_seeklogo-337962.png";
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {paymentMethod === "cod" && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-800">
                You will need to pay the full amount when your car is delivered.
              </p>
            </div>
          )}

          {paymentMethod === "khalti" && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-800">
                You will be redirected to Khalti to complete the payment
                securely.
              </p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || !booking}
            className={`w-full py-3 px-6 rounded-md shadow text-xl font-semibold transition duration-150 ${
              paymentMethod === "khalti"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } ${loading || !booking ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : paymentMethod === "khalti" ? (
              "Pay with Khalti"
            ) : (
              "Confirm Order"
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 px-6 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-150 mt-3 flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
