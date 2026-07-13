import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Store } from "lucide-react";
import { API_URL } from "../../config";
import { useToast } from "../toast/ToastProvider";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        addToast(data.message || "Failed to send reset email.", "error");
        setLoading(false);
        return;
      }

      addToast("Password reset link sent to your email.", "success");
      setEmail("");
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
            Reset your password and get back to business.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
          <Link to="/login" className="flex items-center gap-2 text-blue-600 hover:underline mb-6">
            <ArrowLeft size={18} />
            Back to Login
          </Link>

          <h2 className="text-3xl font-bold text-blue-900 text-center">Reset Password</h2>
          <p className="text-center text-gray-500 mt-2">Enter your email to receive reset link</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full border rounded-lg pl-12 pr-4 py-3 outline-none focus:border-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;