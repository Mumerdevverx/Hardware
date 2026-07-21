import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import DefaultLayout from "../layout/DefaultLayout";
import ProtectedRoute from "../layout/ProtectedRoute";

// Auth Pages
import Login from "../auth/Login";
import Signup from "../auth/Signup";
import ForgetPassword from "../auth/ForgetPassword";

// Pages
import Home from "../pages/Home";
import AddItems from "../pages/AddItems";
import Stocks from "../pages/Stocks";
import Billing from "../pages/Billing";
import Suppliers from "../pages/Suppliers";
import Dealers from "../pages/Dealers";
import Expense from "../pages/Expense";
import History from "../pages/History";
import Barrow from "../pages/Barrow";
import Reports from "../pages/Reports";
import Sales from "../pages/Sales";

const AllRoutes = ({ isAuthenticated, setIsAuthenticated, user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("pos-user");
    localStorage.removeItem("pos-token");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DefaultLayout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="history" element={<History />} />
        <Route path="barrow" element={<Barrow />} />
        <Route path="sales" element={<Sales />} />
        <Route path="reports" element={<Reports />} />
        <Route path="add-items" element={<AddItems />} />
        <Route path="stocks" element={<Stocks />} />
        <Route path="billing" element={<Billing />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="dealers" element={<Dealers />} />
        <Route path="expense" element={<Expense />} />
      </Route>
    </Routes>
  );
};

export default AllRoutes;
