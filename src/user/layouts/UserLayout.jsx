import React from "react";
import { Outlet } from "react-router-dom";
import UserNav from "../components/UserNav";
import { useAuth } from "../../pages/auth/AuthContext";
import Navbar from "../../components/Navbar";

const UserLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={logout} />
      <main className="p-6 pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
