import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter as Router,
} from "react-router-dom";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { AuthProvider, useAuth } from "./pages/auth/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/home/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./user/pages/Profile";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import AdminLogin from "./admin/pages/AdminLogin";

import AdminDashboard from "./admin/components/AdminDashboard";
import ManageCars from "./admin/components/ManageCars";
import ManageUsers from "./admin/components/ManageUsers";
import ManageBookings from "./admin/components/ManageBookings";
import AddCar from "./admin/components/AddCar";
import EditCar from "./admin/components/EditCar";
import UserHome from "./user/pages/userHome";
import UserDashboard from "./user/pages/UserDashboard";

import ErrorBoundary from "./user/components/ErrorBoundary";
import AdminLayout from "./admin/components/AdminLayout";
import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import Car from "./user/pages/Car";
import CarDetail from "./user/pages/CarDetail";
import UserLayout from "./user/layouts/UserLayout";
import Bookings from "./user/pages/Bookings";
import Review from "./user/pages/Review";
import MyBookings from "./user/pages/MyBookings";
import Wishlist from "./user/pages/Wishlist";
import Navbar from "./components/Navbar";
import Payment from "./user/pages/Payment";
import ReviewManage from "./admin/components/ReviewManage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ManageClientReviews from "./admin/components/ManageClientReviews";
import ManageMessages from "./admin/components/ManageMessages";
import ManageDriver from "./admin/components/ManageDriver"; // Import ManageDriver component
import PaymentConfirmation from "./user/pages/PaymentConfirmation"; // Import the new PaymentConfirmation component

function App() {
  const location = useLocation();
  const noNavbarRoutes = ["/auth/signin", "/auth/signup", "/admin/login"];

  return (
    <AuthProvider>
      <AdminAuthProvider>
        {!noNavbarRoutes.includes(location.pathname) && <Navbar />}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="auth/signin" element={<SignIn />} />
            <Route path="auth/signup" element={<SignUp />} />
            <Route path="auth/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected user routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="home" element={<UserHome />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:carId" element={<Bookings />} />
            <Route path="mybooking" element={<MyBookings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="cars" element={<Car />} />
            <Route path="review/:carId" element={<Review />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="payment" element={<Payment />} />
            <Route
              path="payment-confirmation"
              element={<PaymentConfirmation />}
            />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              // <ProtectedAdminRoute>
              <AdminLayout />
              /* </ProtectedAdminRoute> */
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="manage-cars" element={<ManageCars />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-drivers" element={<ManageDriver />} />{" "}
            {/* Add ManageDriver route */}
            <Route path="add-car" element={<AddCar />} />
            <Route path="edit-car/:id" element={<EditCar />} />
            <Route path="reviews" element={<ReviewManage />} />
            <Route path="client-reviews" element={<ManageClientReviews />} />
            <Route path="messages" element={<ManageMessages />} />
          </Route>

          <Route path="*" element={<Home />} />
          <Route path="/car/:id" element={<CarDetail />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
