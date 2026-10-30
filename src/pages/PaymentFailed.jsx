import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const PaymentFailed = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-200">
        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-5" />

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Payment Failed
        </h1>

        <p className="text-slate-500 mb-8">
          Your payment could not be completed. Your booking may still be
          pending. You can return to your dashboard to check its status and try
          paying again.
        </p>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Check My Bookings
          </Link>

          <Link
            to="/"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition"
          >
            Return to Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
