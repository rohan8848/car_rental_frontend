import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import { format } from "date-fns";
import { getDriverImageUrl, getLicenseImageUrl } from "../../utils/imageUtils";

const ManageDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [pendingBookingId, setPendingBookingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    status: "available",
  });

  // File state
  const [profileImage, setProfileImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [licensePreview, setLicensePreview] = useState("");

  // Assignment state
  const [selectedBookingId, setSelectedBookingId] = useState("");

  // Fetch all drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/drivers");
      if (response.data.success) {
        setDrivers(response.data.data);
      } else {
        toast.error("Failed to fetch drivers");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Error loading drivers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available bookings for driver assignment
  const fetchAvailableBookings = async () => {
    try {
      const response = await api.get("/admin/bookings");
      if (response.data.success) {
        // Filter bookings that need drivers but don't have one assigned
        const bookings = response.data.data.filter(
          (booking) => booking.needsDriver && !booking.driverAssigned
        );
        setAvailableBookings(bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load available bookings");
    }
  };

  useEffect(() => {
    fetchDrivers();

    // Check for pending assignment from booking page
    const pendingAssignmentId = sessionStorage.getItem(
      "pendingAssignmentBookingId"
    );
    if (pendingAssignmentId) {
      setPendingBookingId(pendingAssignmentId);
      // Clear the session storage
      sessionStorage.removeItem("pendingAssignmentBookingId");
    }
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;

    // Create preview
    const previewURL = URL.createObjectURL(files[0]);

    if (name === "profileImage") {
      setProfileImage(files[0]);
      setProfilePreview(previewURL);
    } else if (name === "licenseImage") {
      setLicenseImage(files[0]);
      setLicensePreview(previewURL);
    }
  };

  // Open modal to add new driver
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      licenseNumber: "",
      phone: "",
      email: "",
      address: "",
      dateOfBirth: "",
      experience: "",
      status: "available",
    });
    setProfileImage(null);
    setLicenseImage(null);
    setProfilePreview("");
    setLicensePreview("");
    setIsModalOpen(true);
  };

  // Open modal to edit driver
  const openEditModal = (driver) => {
    setIsEditing(true);
    setCurrentDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone,
      email: driver.email,
      address: driver.address,
      dateOfBirth: driver.dateOfBirth ? driver.dateOfBirth.slice(0, 10) : "",
      experience: driver.experience,
      status: driver.status,
    });
    setProfilePreview(driver.profileImage || "");
    setLicensePreview(driver.licenseImage || "");
    setIsModalOpen(true);
  };

  // Open driver details modal
  const openViewModal = (driver) => {
    setCurrentDriver(driver);
    setIsViewModalOpen(true);
  };

  // Open driver assignment modal with pre-selected booking if available
  const openAssignModal = (driver) => {
    setCurrentDriver(driver);
    fetchAvailableBookings().then(() => {
      // If there's a pending booking ID from the bookings page, pre-select it
      if (pendingBookingId) {
        setSelectedBookingId(pendingBookingId);
        setPendingBookingId(null); // Clear after using
      }
      setIsAssignModalOpen(true);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = new FormData();

      // Add all text fields
      Object.keys(formData).forEach((key) => {
        formDataObj.append(key, formData[key]);
      });

      // Add files if available
      if (profileImage) {
        formDataObj.append("profileImage", profileImage);
      }

      if (licenseImage) {
        formDataObj.append("licenseImage", licenseImage);
      }

      let response;
      if (isEditing) {
        response = await api.put(
          `/admin/drivers/${currentDriver._id}`,
          formDataObj,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Driver updated successfully");
      } else {
        response = await api.post("/admin/drivers", formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Driver added successfully");
      }

      setIsModalOpen(false);
      fetchDrivers();
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error(error.response?.data?.message || "Failed to save driver");
    }
  };

  // Handle driver deletion
  const handleDelete = async (driverId) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await api.delete(`/admin/drivers/${driverId}`);
        toast.success("Driver deleted successfully");
        fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
        toast.error(error.response?.data?.message || "Failed to delete driver");
      }
    }
  };

  // Handle driver status change
  const handleStatusChange = async (driverId, newStatus) => {
    try {
      await api.put(`/admin/drivers/${driverId}`, { status: newStatus });
      toast.success("Driver status updated");
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast.error("Failed to update driver status");
    }
  };

  // Handle driver assignment
  const handleAssignDriver = async () => {
    if (!selectedBookingId) {
      toast.error("Please select a booking");
      return;
    }

    try {
      const response = await api.post("/admin/drivers/assign", {
        driverId: currentDriver._id,
        bookingId: selectedBookingId,
      });

      if (response.data.success) {
        toast.success("Driver assigned successfully");
        setIsAssignModalOpen(false);
        fetchDrivers();
      } else {
        toast.error("Failed to assign driver");
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error(error.response?.data?.message || "Failed to assign driver");
    }
  };

  // Handle completing a driver assignment
  const handleCompleteAssignment = async (driverId) => {
    try {
      const response = await api.post("/admin/drivers/complete-assignment", {
        driverId,
      });

      if (response.data.success) {
        toast.success("Assignment completed successfully");
        fetchDrivers();
      } else {
        toast.error("Failed to complete assignment");
      }
    } catch (error) {
      console.error("Error completing assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete assignment"
      );
    }
  };

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm)
  );

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "on-leave":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Drivers</h2>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" /> Add New Driver
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers by name, license number or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No drivers found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Driver
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    License
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Experience
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {driver.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getDriverImageUrl(driver.profileImage)}
                              alt={driver.name}
                              onError={(e) => {
                                console.error(
                                  "Failed to load driver image:",
                                  driver.profileImage
                                );
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/40?text=Driver";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiUser className="text-blue-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {driver._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {driver.licenseNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {driver.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          driver.status
                        )}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {driver.experience} years
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openViewModal(driver)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(driver)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>

                        {driver.status === "available" && (
                          <button
                            onClick={() => openAssignModal(driver)}
                            className="text-green-600 hover:text-green-900 ml-2"
                          >
                            Assign
                          </button>
                        )}

                        {driver.status === "assigned" && (
                          <button
                            onClick={() => handleCompleteAssignment(driver._id)}
                            className="text-orange-600 hover:text-orange-900 ml-2"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add/Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {isEditing ? "Edit Driver" : "Add New Driver"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    rows={2}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="on-leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    name="profileImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {profilePreview && (
                    <div className="mt-2">
                      <img
                        src={profilePreview}
                        alt="Profile Preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Image
                  </label>
                  <input
                    type="file"
                    name="licenseImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {licensePreview && (
                    <div className="mt-2">
                      <img
                        src={licensePreview}
                        alt="License Preview"
                        className="h-20 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? "Update Driver" : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {isViewModalOpen && currentDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Driver Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  {currentDriver.profileImage ? (
                    <img
                      src={getDriverImageUrl(currentDriver.profileImage)}
                      alt={currentDriver.name}
                      className="h-40 w-40 object-cover rounded-full"
                      onError={(e) => {
                        console.error(
                          "Failed to load driver image in modal:",
                          currentDriver.profileImage
                        );
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=Driver";
                      }}
                    />
                  ) : (
                    <div className="h-40 w-40 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiUser size={60} className="text-blue-500" />
                    </div>
                  )}
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {currentDriver.name}
                  </h3>
                  <span
                    className={`mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                      currentDriver.status
                    )}`}
                  >
                    {currentDriver.status}
                  </span>
                </div>

                {currentDriver.licenseImage && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      License Image
                    </h4>
                    <img
                      src={getLicenseImageUrl(currentDriver.licenseImage)}
                      alt="Driver License"
                      className="w-full object-contain rounded"
                      onError={(e) => {
                        console.error(
                          "Failed to load license image:",
                          currentDriver.licenseImage
                        );
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=License";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 gap-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">License Number:</span>
                      <span className="font-medium text-gray-900">
                        {currentDriver.licenseNumber}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {currentDriver.phone}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-900">
                        {currentDriver.email}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-medium text-gray-900">
                        {currentDriver.dateOfBirth
                          ? format(new Date(currentDriver.dateOfBirth), "PPP")
                          : "Not provided"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Experience:</span>
                      <span className="font-medium text-gray-900">
                        {currentDriver.experience} years
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p className="mt-1 text-gray-900">
                        {currentDriver.address}
                      </p>
                    </div>
                  </div>
                </div>

                {currentDriver.currentBooking && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">
                      Current Assignment
                    </h4>
                    <div className="flex items-center text-blue-800">
                      <FiCalendar className="mr-2" />
                      <span>
                        Assigned to booking ID: {currentDriver.currentBooking}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleCompleteAssignment(currentDriver._id);
                        setIsViewModalOpen(false);
                      }}
                      className="mt-3 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      Complete Assignment
                    </button>
                  </div>
                )}

                {currentDriver.bookingHistory &&
                  currentDriver.bookingHistory.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Booking History
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        {currentDriver.bookingHistory.map((history, index) => (
                          <div
                            key={index}
                            className="mb-2 pb-2 border-b border-gray-200 last:border-0"
                          >
                            <div className="flex justify-between">
                              <span>Booking: {history.booking}</span>
                              <span className="text-sm text-gray-600">
                                {format(new Date(history.assignedAt), "PPP")}
                              </span>
                            </div>
                            {history.completedAt && (
                              <div className="text-sm text-green-600 mt-1">
                                Completed:{" "}
                                {format(new Date(history.completedAt), "PPP")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {isAssignModalOpen && currentDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Assign Driver to Booking
              </h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiXCircle size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Assigning{" "}
              <span className="font-semibold">{currentDriver.name}</span> to a
              booking.
            </p>

            {availableBookings.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No bookings available that require a driver.
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Booking
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a booking --</option>
                  {availableBookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      ID: {booking._id.slice(-6)} -{" "}
                      {booking.car?.name || "Unknown car"} -{" "}
                      {booking.user?.name || "Unknown user"} -{" "}
                      {format(new Date(booking.startDate), "PPP")}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedBookingId || availableBookings.length === 0}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                  !selectedBookingId || availableBookings.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDriver;
