import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axios";

const ResetPassword = () => {
const location=useLocation();
const navigate=useNavigate();


const [email,setEmail]=useState(location.state?.email||"")
const [otp,setOtp]=useState("");
const [loading,setLoading]=useState(false)
const [error,setError]=useState("");

const [newPassword,setNewPassword]=useState("");
const [confirmPassword,setConfirmPassword]=useState("");


const handleSubmit=async(e)=>{
    e.preventDefault()
    setError("");
    if(newPassword!==confirmPassword){
        return setError("Password do not match");
    }
setLoading(true)

try {
    const {data}=await api.post("/auth/reset-password",{
        email,
        otp,
        newPassword
    })
    alert(data.message);
    navigate("/login")
} catch (error) {
    setError(error.response?.data?.message||"Something went wrong")
}
finally{
    setLoading(false)
}

}
 return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Reset Password
        </h2>

        <p className="text-gray-500">
          Enter the OTP sent to your email and choose a new password.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center shadow-inner border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            OTP
          </label>

          <input
            type="text"
            required
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm text-center tracking-widest font-bold"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password
          </label>

          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>

          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center mt-8 text-gray-600">
        Back to{" "}
        <Link
          to="/login"
          className="text-gray-900 font-bold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;