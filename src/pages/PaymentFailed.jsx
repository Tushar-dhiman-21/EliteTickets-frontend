import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const PaymentFailed = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-200">

        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-5" />

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Booking Failed
        </h1>

        <p className="text-slate-500 mb-8">
          We couldn't process your payment. Please check your payment
          details and try again.
        </p>

        <div className="space-y-3">

          <Link
            to="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Return to Events
          </Link>

          <Link
            to="/dashboard"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition"
          >
            Go to Dashboard
          </Link>

        </div>

      </div>

    </div>
  );
};

export default PaymentFailed;