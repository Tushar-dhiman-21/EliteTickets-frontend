import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaTicketAlt } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!showOTP) {
        const data = await login(email, password);
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        const data = await verifyOTP(email, otp);
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }
    } 
    
    catch (error) {

  if (error.response?.data?.needsVerification) {
    setShowOTP(true);
    setError(
      "Account not verified. A new OTP has been sent to your email."
    );
  } else {
    setError(
      error.response?.data?.message || error.message
    );
  }

}
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/30">
            <FaTicketAlt className="text-xl" />
          </span>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-neutral-500">Sign in to your EliteTickets account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center shadow-inner border border-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!showOTP ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition shadow-sm"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition shadow-sm"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-neutral-600 hover:text-amber-600 font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition shadow-sm font-bold tracking-widest text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold py-3 rounded-lg hover:from-amber-300 hover:to-amber-400 focus:ring-4 focus:ring-amber-200 transition shadow-md shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : showOTP
                  ? "Verify OTP & Log In"
                  : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-neutral-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-600 font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
