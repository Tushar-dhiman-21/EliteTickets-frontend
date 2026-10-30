import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaEnvelope, FaTicketAlt } from "react-icons/fa";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const emailSent = searchParams.get("emailSent");

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
        <FaCheckCircle className="mx-auto mb-5 text-6xl text-green-500" />

        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Booking Confirmed!
        </h1>

        <p className="mb-6 text-slate-600">
          Your payment has been verified and your event booking is confirmed.
        </p>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
          <div className="flex items-start gap-3">
            <FaEnvelope className="mt-1 text-xl text-slate-700" />

            <div>
              <h2 className="font-semibold text-slate-900">Ticket email</h2>

              {emailSent === "true" ? (
                <p className="mt-1 text-sm text-slate-600">
                  Your ticket email was sent. Please check your inbox and spam
                  folder.
                </p>
              ) : emailSent === "false" ? (
                <p className="mt-1 text-sm text-slate-600">
                  Your booking is confirmed, but the ticket email could not be
                  sent. Check your dashboard or contact support.
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-600">
                  Your booking is confirmed. Check your dashboard for booking
                  details and ticket information.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            <FaTicketAlt />
            My Bookings
          </Link>

          <Link
            to="/events"
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
