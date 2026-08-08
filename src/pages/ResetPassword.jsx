import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 sm:mt-16">

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">

        {/* Heading */}
        <div className="text-center mb-8">

          

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Reset Password
          </h2>

          <p className="text-slate-500">
            Enter the OTP sent to your email and choose a new password.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* OTP */}
          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              OTP
            </label>

            <input
              type="text"
              required
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm text-center tracking-widest font-bold"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
            />

          </div>

          {/* New Password */}
          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

          </div>

          {/* Confirm Password */}
          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition shadow-md ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100"
            }`}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        {/* Login */}
        <p className="text-center mt-8 text-slate-600">

          Back to{" "}

          <Link
            to="/login"
            className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
          >
            Sign In
          </Link>

        </p>

      </div>

    </div>
  );
};

export default ResetPassword;
