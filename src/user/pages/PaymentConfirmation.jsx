import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import api from "../../services/api";

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, failed
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get parameters from URL
  const pidx = searchParams.get("pidx");
  const status = searchParams.get("status");
  const purchase_order_id = searchParams.get("purchase_order_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!pidx) {
        setVerificationStatus("failed");
        setLoading(false);
        return;
      }

      try {
        console.log("Verifying payment with pidx:", pidx);

        // Use the specialized payment API method
        const response = await api.payment.lookupKhaltiPayment(pidx);

        console.log("Payment verification response:", response.data);

        if (response.data.success) {
          // Check booking/payment status for more accurate UI
          const booking = response.data.booking;
          setBooking(booking);
          if (
            booking &&
            (booking.status === "confirmed" ||
              booking.paymentStatus === "completed" ||
              (response.data.data && response.data.data.status === "Completed"))
          ) {
            setVerificationStatus("success");
            toast.success("Payment verified successfully!");
          } else if (
            response.data.data &&
            response.data.data.status === "Pending"
          ) {
            setVerificationStatus("pending");
            toast.info("Payment verification in progress. Please wait...");
          } else {
            setVerificationStatus("failed");
            toast.error(
              response.data.message ||
                "Payment verification failed or not confirmed."
            );
          }
        } else if (response.status === 202) {
          // Payment is still pending
          setVerificationStatus("pending");
          toast.info("Payment verification in progress. Please wait...");
        } else {
          setVerificationStatus("failed");
          toast.error(response.data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setVerificationStatus("failed");
        toast.error(
          error.response?.data?.message || "Payment verification failed"
        );
      } finally {
        setLoading(false);
      }
    };

    if (pidx) {
      verifyPayment();
    } else {
      setLoading(false);
      setVerificationStatus("failed");
    }
  }, [pidx]);

  const renderStatusMessage = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
              <FiCheckCircle size={36} />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed successfully.
            </p>
            {booking && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Booking Details
                </h3>
                <p className="text-sm text-gray-600">
                  Booking ID: {booking._id}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {booking.status}
                </p>
                <p className="text-sm text-gray-600">
                  Car: {booking.car?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {new Date(booking.startDate).toLocaleDateString()}{" "}
                  to {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        );
      case "pending":
        return (
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
              <FiClock size={36} />
            </div>
            <h2 className="text-2xl font-bold text-yellow-700 mb-2">
              Payment Processing
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. This may take a moment.
            </p>
            <div className="animate-pulse flex justify-center mb-6">
              <div className="h-2 w-24 bg-yellow-200 rounded"></div>
            </div>
          </div>
        );
      case "failed":
        return (
          <div className="text-center">
            <div className="bg-red-100 text-red-800 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
              <FiXCircle size={36} />
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              There was an issue processing your payment. Please try again.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Payment Confirmation
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {renderStatusMessage()}

            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/user/mybooking")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                View My Bookings <FiArrowRight className="ml-2" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmation;
