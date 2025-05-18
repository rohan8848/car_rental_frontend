import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import api from "../../services/api";

import {
  FiPrinter,
  FiCheck,
  FiX,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiTruck,
} from "react-icons/fi";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { getFullImageUrl, getDriverImageUrl } from "../../utils/imageUtils";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        const response = await api.get("/admin/bookings");

        if (response.data.success) {
          setBookings(response.data.data || []);
          console.log(
            "Bookings fetched successfully:",
            response.data.data?.length || 0
          );
        } else {
          setBookings([]);
          console.warn("No bookings found or unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/bookings/${id}`);
      if (response.data.success) {
        setBookings(bookings.filter((booking) => booking._id !== id));
        toast.success("Booking deleted successfully");
      } else {
        console.error("Error deleting booking:", response.data.message);
        toast.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Error deleting booking");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status });
      if (response.data.success) {
        setBookings(
          bookings.map((booking) =>
            booking._id === id
              ? { ...booking, status: response.data.data.status }
              : booking
          )
        );
        toast.success(`Booking status updated to ${status}`);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDirectionsUrl = (lat, lng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  };

  const calculateTotalAmount = (booking) => {
    if (booking.totalAmount) {
      return booking.totalAmount;
    }

    if (
      booking.car &&
      booking.car.price &&
      booking.startDate &&
      booking.endDate
    ) {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const durationDays = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const driverPrice = booking.needsDriver ? 1000 * durationDays : 0;
      return booking.car.price * durationDays + driverPrice;
    }

    return "N/A";
  };

  const printInvoice = (booking) => {
    const printWindow = window.open("", "_blank");

    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const durationDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const carPrice = booking.car?.price || 0;
    const totalAmount = calculateTotalAmount(booking);
    const driverPrice = booking.needsDriver ? 1000 : 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${booking._id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3B82F6;
            margin-bottom: 5px;
          }
          .invoice-id {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .total-section {
            margin-top: 20px;
            text-align: right;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">Car Rental Service</div>
            <div class="invoice-id">INVOICE #${booking._id
              .slice(-6)
              .toUpperCase()}</div>
            <div>Date: ${format(new Date(), "MMM dd, yyyy")}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Details</div>
            <div>Name: ${booking.user?.name || "N/A"}</div>
            <div>Email: ${booking.email || "N/A"}</div>
            <div>Phone: ${booking.contact || "N/A"}</div>
            <div>Address: ${booking.address || "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Booking Details</div>
            <div>Car: ${booking.car?.name || "N/A"}</div>
            <div>Status: ${booking.status}</div>
            <div>Driver Required: ${booking.needsDriver ? "Yes" : "No"}</div>
            <div>Booking Date: ${format(
              new Date(booking.createdAt),
              "MMM dd, yyyy"
            )}</div>
            <div>Pickup Date: ${format(startDate, "MMM dd, yyyy")}</div>
            <div>Return Date: ${format(endDate, "MMM dd, yyyy")}</div>
            <div>Duration: ${durationDays} days</div>
          </div>
          
          <div class="section">
            <div class="section-title">Charges</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Days</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.car?.name} Rental</td>
                  <td>${durationDays}</td>
                  <td>Rs. ${carPrice}/day</td>
                  <td>Rs. ${carPrice * durationDays}</td>
                </tr>
                ${
                  booking.needsDriver
                    ? `
                <tr>
                  <td>Driver Service</td>
                  <td>${durationDays}</td>
                  <td>Rs. 1,000/day</td>
                  <td>Rs. ${1000 * durationDays}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Total</strong></td>
                  <td>Rs. ${totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing our service!</p>
            <p>For any queries, please contact us at support@carrental.com</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #3B82F6; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const getCarName = (car) => {
    if (!car) return "Unknown Car";
    return car.name || car.title || "Unnamed Car";
  };

  const getCarImage = (car) => {
    if (!car || !car.images || car.images.length === 0) {
      return "https://via.placeholder.com/150?text=No+Image";
    }
    return getFullImageUrl(car.images[0]);
  };

  const handleAssignDriver = (bookingId) => {
    sessionStorage.setItem("pendingAssignmentBookingId", bookingId);
    navigate("/admin/manage-drivers");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <h3 className="text-lg font-semibold">
                        Booking #{booking._id.slice(-6).toUpperCase()}
                      </h3>

                      {booking.needsDriver && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
                          <FiTruck className="mr-1" />
                          With Driver
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-full sm:w-1/3 h-32 min-w-[120px] overflow-hidden rounded-lg shadow-md flex-shrink-0">
                          <img
                            src={getCarImage(booking.car)}
                            alt={getCarName(booking.car)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {getCarName(booking.car)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {booking.car?.brand} {booking.car?.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            Rs. {booking.car?.price}/day
                          </p>
                        </div>
                      </div>

                      <div className="border-l pl-6">
                        <h4 className="font-medium mb-2 flex items-center">
                          <FiUser className="mr-2 text-blue-500" />
                          Customer Details
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <FiUser className="mr-2 text-gray-400" />
                          {booking.user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <FiMail className="mr-2 text-gray-400" />
                          {booking.email || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <FiPhone className="mr-2 text-gray-400" />
                          {booking.contact || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <FiMapPin className="mr-2 text-gray-400" />
                          {booking.address || "N/A"}
                        </p>
                        {booking.paymentMethod === "khalti" &&
                          booking.transactionId && (
                            <p className="text-sm text-purple-700 font-medium mt-1">
                              Khalti Transaction ID: {booking.transactionId}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Booking Period</h4>
                        <p className="text-sm text-gray-600">
                          From:{" "}
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          To: {new Date(booking.endDate).toLocaleDateString()}
                        </p>

                        <div className="text-sm text-gray-600 mt-2">
                          <span>Total Amount: </span>
                          <span className="font-semibold">
                            Rs. {calculateTotalAmount(booking)}
                          </span>
                        </div>

                        {booking.needsDriver && (
                          <div className="mt-2 text-sm bg-blue-50 p-2 rounded border border-blue-100">
                            <span className="font-medium">Driver Included</span>
                            <p className="text-xs text-gray-600">
                              Rs. 1,000/day ×{" "}
                              {Math.ceil(
                                (new Date(booking.endDate) -
                                  new Date(booking.startDate)) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days = Rs.{" "}
                              {booking.driverPrice ||
                                1000 *
                                  Math.ceil(
                                    (new Date(booking.endDate) -
                                      new Date(booking.startDate)) /
                                      (1000 * 60 * 60 * 24)
                                  )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Location Details</h4>
                        {booking.hasSeparateLocations ? (
                          <>
                            <p className="text-sm text-gray-600">
                              Pickup: {booking.pickupAddress || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Dropoff: {booking.dropoffAddress || "N/A"}
                            </p>
                            {booking.pickupCoords && (
                              <a
                                href={getDirectionsUrl(
                                  booking.pickupCoords.lat,
                                  booking.pickupCoords.lng
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline block mt-1"
                              >
                                Get Pickup Directions
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">
                              {booking.address || "N/A"}
                            </p>
                            {booking.location && (
                              <a
                                href={getDirectionsUrl(
                                  booking.location.lat,
                                  booking.location.lng
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline block mt-1"
                              >
                                Get Directions
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Driver Information Section */}
                    {booking.needsDriver && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <FiTruck className="mr-2 text-blue-500" /> Driver
                          Request
                        </h4>

                        {booking.driverAssigned && booking.driver ? (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {booking.driver.profileImage ? (
                                  <img
                                    src={getDriverImageUrl(
                                      booking.driver.profileImage
                                    )}
                                    alt={booking.driver.name || "Driver"}
                                    className="h-12 w-12 rounded-full object-cover"
                                    onError={(e) => {
                                      console.log(
                                        "Driver image failed to load:",
                                        booking.driver.profileImage
                                      );
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/48?text=Driver";
                                    }}
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                                    <FiUser className="text-blue-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <h5 className="text-sm font-semibold text-gray-800">
                                  {booking.driver.name ||
                                    "Driver Name Unavailable"}
                                </h5>
                                <div className="text-xs text-gray-600">
                                  <p>
                                    License:{" "}
                                    {booking.driver.licenseNumber ||
                                      "Not available"}
                                  </p>
                                  <p>
                                    Phone:{" "}
                                    {booking.driver.phone || "Not available"}
                                  </p>
                                  <p>
                                    Experience: {booking.driver.experience || 0}{" "}
                                    years
                                  </p>
                                </div>
                                <div className="mt-1">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                      booking.driver.status || "unknown"
                                    )}`}
                                  >
                                    {booking.driver.status || "unknown status"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex flex-col sm:flex-row sm:items-center justify-between">
                            <p className="text-sm text-yellow-700 mb-2 sm:mb-0">
                              Driver requested but not yet assigned
                            </p>
                            <button
                              onClick={() => handleAssignDriver(booking._id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg flex items-center"
                            >
                              <FiUser className="mr-1" /> Assign Driver
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 justify-end items-center pt-4 border-t">
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      handleStatusChange(booking._id, e.target.value)
                    }
                    className="px-4 py-2 border rounded-lg mr-auto"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => printInvoice(booking)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  >
                    <FiPrinter className="mr-2" />
                    Print Invoice
                  </button>

                  <button
                    onClick={() => handleDelete(booking._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                  >
                    <FiX className="mr-2" />
                    Delete
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

export default ManageBookings;
