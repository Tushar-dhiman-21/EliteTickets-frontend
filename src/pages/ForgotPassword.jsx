import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axios";


const ForgotPassword = () => {
    const [email,setEmail]=useState("");
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState("")
    const navigate=useNavigate()

    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true);
        setError("");

        try {
            const {data}=await api.post("/auth/forgot-password",{email})
       alert(data.message);
       navigate("/reset-password",{
        state:{email}
       })
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
          Forgot Password
        </h2>

        <p className="text-gray-500">
          Enter your email to receive a verification OTP.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center shadow-inner border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>

      <p className="text-center mt-8 text-gray-600">
        Remember your password?{" "}
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

export default ForgotPassword;