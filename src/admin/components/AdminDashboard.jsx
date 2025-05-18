import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiUser,
  FiTruck,
  FiDollarSign,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import api from "../../services/api";
import { useAdminAuth } from "../context/AdminAuthContext";

const StatCard = ({ icon: Icon, title, value, percentage, isIncrease }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-xl shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <span
        className={`flex items-center ${
          isIncrease ? "text-green-500" : "text-red-500"
        }`}
      >
        {percentage}%
      </span>
    </div>
  </motion.div>
);

const formatCurrency = (value) => {
  return `Rs. ${value?.toLocaleString() || 0}`;
};

const generateMockData = () => {
  return {
    stats: {
      totalUsers: Math.floor(Math.random() * 100) + 50,
      totalCars: Math.floor(Math.random() * 30) + 10,
      totalBookings: Math.floor(Math.random() * 200) + 100,
      totalRevenue: Math.floor(Math.random() * 500000) + 100000,
      bookingStats: {
        pending: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 50) + 20,
        cancelled: Math.floor(Math.random() * 10) + 2,
      },
    },
    recentBookings: Array.from({ length: 5 }, (_, i) => ({
      _id: `mock-${i}`,
      user: { name: `User ${i + 1}`, email: `user${i + 1}@example.com` },
      car: { name: `Car Model ${i + 1}`, title: `Car ${i + 1}` },
      startDate: new Date(Date.now() - i * 86400000).toISOString(),
      endDate: new Date(Date.now() + (7 - i) * 86400000).toISOString(),
      status: ["pending", "completed", "cancelled"][
        Math.floor(Math.random() * 3)
      ],
      totalAmount: Math.floor(Math.random() * 10000) + 5000,
    })),
  };
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usedMockData, setUsedMockData] = useState(false);
  const [mostBookedCars, setMostBookedCars] = useState({
    labels: [],
    datasets: [],
  });
  const { logout } = useAdminAuth();

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      console.log("Fetching dashboard data...");
      const response = await api.get("/admin/dashboard");
      console.log("Dashboard API response:", response);

      let data;
      if (response?.data?.data) {
        data = response.data.data;
        setUsedMockData(false);
      } else {
        console.warn("Invalid data structure from API, using mock data");
        data = generateMockData();
        setUsedMockData(true);
      }

      setStats({
        totalUsers: data.stats?.totalUsers || 0,
        totalCars: data.stats?.totalCars || 0,
        totalBookings: data.stats?.totalBookings || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
        bookingStats: {
          pending: data.stats?.bookingStats?.pending || 0,
          completed: data.stats?.bookingStats?.completed || 0,
          cancelled: data.stats?.bookingStats?.cancelled || 0,
        },
      });

      let bookingsData = [];
      if (
        Array.isArray(data.recentBookings) &&
        data.recentBookings.length > 0
      ) {
        console.log("Recent bookings found:", data.recentBookings.length);
        bookingsData = data.recentBookings;
      } else if (Array.isArray(data.bookings) && data.bookings.length > 0) {
        console.log(
          "Bookings found in alternative location:",
          data.bookings.length
        );
        bookingsData = data.bookings;
      } else {
        console.log("No valid bookings data found");
        bookingsData = data.recentBookings || [];
      }

      const processedBookings = bookingsData.map((booking) => {
        return {
          _id:
            booking._id ||
            booking.id ||
            `temp-${Math.random().toString(36).substr(2, 9)}`,
          user: booking.user || {
            name: "Unknown",
            email: "unknown@example.com",
          },
          car:
            booking.car && (booking.car.name || booking.car.title)
              ? booking.car
              : {
                  name: "Unknown Car",
                  title: "Unknown Car",
                  brand: "N/A",
                  price: 0,
                },
          startDate: booking.startDate || new Date().toISOString(),
          endDate: booking.endDate || new Date().toISOString(),
          status: booking.status || "pending",
          totalAmount: booking.totalAmount || 0,
        };
      });

      setRecentBookings(processedBookings);

      const bookingStats = data.stats?.bookingStats || {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      setChartData({
        labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
        datasets: [
          {
            label: "Bookings",
            data: [
              bookingStats.pending || 0,
              bookingStats.confirmed || 0,
              bookingStats.completed || 0,
              bookingStats.cancelled || 0,
            ],
            backgroundColor: ["#FFCE56", "#36A2EB", "#36A2EB", "#FF6384"],
            borderColor: ["#FFCE56", "#36A2EB", "#36A2EB", "#FF6384"],
            borderWidth: 1,
          },
        ],
      });

      const carBookingStats = processCarBookingStats(bookingsData);

      setMostBookedCars({
        labels: carBookingStats.labels,
        datasets: [
          {
            label: "Number of Bookings",
            data: carBookingStats.values,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#8AC926",
              "#1982C4",
              "#6A4C93",
              "#F94144",
            ],
            borderWidth: 1,
          },
        ],
      });

      if (usedMockData) {
        toast.info("Using demo data - API connection issue");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        logout();
        return;
      }

      setError("Failed to load dashboard data. Using demo data.");

      const mockData = generateMockData();
      setStats({
        totalUsers: mockData.stats.totalUsers,
        totalCars: mockData.stats.totalCars,
        totalBookings: mockData.stats.totalBookings,
        totalRevenue: mockData.stats.totalRevenue,
        bookingStats: mockData.stats.bookingStats,
      });

      setRecentBookings(mockData.recentBookings);

      setChartData({
        labels: ["Pending", "Completed", "Cancelled"],
        datasets: [
          {
            label: "Bookings",
            data: [
              mockData.stats.bookingStats.pending,
              mockData.stats.bookingStats.completed,
              mockData.stats.bookingStats.cancelled,
            ],
            backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384"],
            borderColor: ["#FFCE56", "#36A2EB", "#FF6384"],
            borderWidth: 1,
          },
        ],
      });

      setMostBookedCars({
        labels: [
          "Car Model A",
          "Car Model B",
          "Car Model C",
          "Car Model D",
          "Car Model E",
        ],
        datasets: [
          {
            label: "Number of Bookings",
            data: [24, 19, 14, 12, 8],
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
            borderWidth: 1,
          },
        ],
      });

      setUsedMockData(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  const processCarBookingStats = (bookings) => {
    const carBookings = {};

    bookings.forEach((booking) => {
      if (booking.car && (booking.car.name || booking.car.title)) {
        const carName = booking.car.name || booking.car.title;
        carBookings[carName] = (carBookings[carName] || 0) + 1;
      }
    });

    const entries = Object.entries(carBookings).sort((a, b) => b[1] - a[1]);
    const topCars = entries.slice(0, 5);

    return {
      labels: topCars.map(([name]) => name),
      values: topCars.map(([_, count]) => count),
    };
  };

  useEffect(() => {
    fetchDashboardData();

    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          {usedMockData && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Using demo data - Check API connection
            </p>
          )}
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className={`flex items-center px-4 py-2 rounded-lg ${
            refreshing
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={FiUser}
          title="Total Users"
          value={stats.totalUsers || 0}
          percentage={10}
          isIncrease={true}
        />
        <StatCard
          icon={FiTruck}
          title="Total Cars"
          value={stats.totalCars || 0}
          percentage={5}
          isIncrease={true}
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          percentage={15}
          isIncrease={true}
        />
        <StatCard
          icon={FiCalendar}
          title="Total Bookings"
          value={stats.totalBookings || 0}
          percentage={8}
          isIncrease={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Booking Statistics</h2>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Monthly Revenue</h2>
          <div className="h-64">
            <Line
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label: "Revenue (Rs)",
                    data: [
                      Math.floor(Math.random() * 50000),
                      Math.floor(Math.random() * 50000),
                      Math.floor(Math.random() * 50000),
                      Math.floor(Math.random() * 50000),
                      Math.floor(Math.random() * 50000),
                      stats.totalRevenue || Math.floor(Math.random() * 50000),
                    ],
                    fill: false,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Most Booked Cars</h2>
          <div className="h-80">
            <Doughnut
              data={mostBookedCars}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      boxWidth: 15,
                      padding: 15,
                    },
                  },
                  title: {
                    display: true,
                    text: "Car Booking Frequency",
                    font: {
                      size: 16,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} bookings (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Top Performing Cars</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: mostBookedCars.labels,
                datasets: [
                  {
                    label: "Bookings",
                    data: mostBookedCars.datasets[0]?.data || [],
                    backgroundColor:
                      mostBookedCars.datasets[0]?.backgroundColor || [],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.parsed.y} bookings`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Number of Bookings",
                    },
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No recent bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.car?.name ||
                          booking.car?.title ||
                          "Unknown Car"}
                        {booking.car?.brand ? ` (${booking.car.brand})` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {booking.startDate
                          ? new Date(booking.startDate).toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {booking.endDate
                          ? new Date(booking.endDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs. {booking.totalAmount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
