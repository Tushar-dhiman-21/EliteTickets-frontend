import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const PaymentSuccess = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200">

        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
          Booking Confirmed!
        </h1>

        {/* Message */}
        <p className="text-slate-500 mb-8 text-base sm:text-lg leading-relaxed">
          Your ticket has been booked successfully.
          A confirmation email has been sent to your
          registered email address.
        </p>

        {/* Buttons */}
        <div className="space-y-3">

          <Link
            to="/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md hover:shadow-lg"
          >
            View My Tickets
          </Link>

          <Link
            to="/"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition"
          >
            Discover More Events
          </Link>

        </div>

      </div>

    </div>
  );
};

export default PaymentSuccess;
