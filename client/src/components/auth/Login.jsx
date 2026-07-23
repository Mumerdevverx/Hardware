import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Store } from "lucide-react";
import { API_URL } from "../../config";
import { useToast } from "../toast/ToastProvider";

const Login = ({ setIsAuthenticated, setUser }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        addToast(data.message || "Login failed.", "error");
        setLoading(false);
        return;
      }

      localStorage.setItem("pos-token", data.token);
      localStorage.setItem("pos-user", JSON.stringify(data.data));
      setUser(data.data);
      setIsAuthenticated(true);
      addToast("Login successful!", "success");
      navigate("/home");
    } catch (error) {
      addToast("Unable to reach the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="hidden lg:flex w-1/2 bg-blue-900 text-white items-center justify-center p-10">
        <div className="text-center">
          <Store size={80} className="mx-auto mb-6 text-yellow-400" />
          <h1 className="text-5xl font-bold">POS SYSTEM</h1>
          <p className="mt-6 text-lg text-gray-300 leading-8 max-w-md">
            Manage sales, inventory, customers, and reports from one modern dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-blue-900 text-center">Welcome Back</h2>
          <p className="text-center text-gray-500 mt-2">Login to your POS account</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full border rounded-lg pl-12 pr-4 py-3 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border rounded-lg pl-12 pr-4 py-3 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-blue-600 font-medium hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;