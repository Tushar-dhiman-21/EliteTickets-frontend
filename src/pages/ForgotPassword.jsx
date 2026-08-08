import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/forgot-password", {
        email,
      });

      toast.warning(data.message);

      navigate("/reset-password", {
        state: { email },
      });
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
    <div className="max-w-md mx-auto mt-16 sm:mt-20">

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">

        {/* Heading */}
        <div className="text-center mb-8">

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Forgot Password?
          </h2>

          <p className="text-slate-500">
            Enter your email to receive a verification OTP.
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
          className="space-y-6"
        >

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* Submit */}
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
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>

        {/* Back to Login */}
        <p className="text-center mt-8 text-slate-600">

          Remember your password?{" "}

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

export default ForgotPassword;
