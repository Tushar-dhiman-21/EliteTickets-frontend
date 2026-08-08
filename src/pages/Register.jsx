import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!showOTP) {
        await register(name, email, password);
        setShowOTP(true);
      } else {
        await verifyOTP(email, otp);
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Register Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">

          {/* Heading */}
          <div className="text-center mb-8">

            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Create an Account
            </h2>

            <p className="text-slate-500">
              Join EliteTickets today.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {!showOTP ? (
              <>
                {/* Full Name */}
                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                </div>

                {/* Email */}
                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                </div>

                {/* Password */}
                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                </div>
              </>
            ) : (
              /* OTP */
              <div>

                <div className="bg-blue-50 text-blue-700 p-3 mb-5 rounded-lg border border-blue-100 text-sm text-center">
                  An OTP has been sent to your email. Please verify your
                  account.
                </div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Verification Code (OTP)
                </label>

                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-4 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm font-bold tracking-[0.4em] text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />

                <p className="text-xs text-slate-400 text-center mt-3">
                  Enter the verification code sent to your email.
                </p>

              </div>
            )}

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
                ? "Processing..."
                : showOTP
                ? "Verify & Complete"
                : "Sign Up"}
            </button>

          </form>

          {/* Login Link */}
          {!showOTP && (
            <p className="text-center mt-8 text-slate-600">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition"
              >
                Sign In
              </Link>

            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default Register;
