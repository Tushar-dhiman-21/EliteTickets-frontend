import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import paymentQR from "../assets/paymentQrCode.png";

const Payment = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get("/bookings/my");

        const currentBooking = data.find(
          (booking) => booking._id === id
        );

        setBooking(currentBooking);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) {
      setMessage("Please enter the Transaction ID (UTR).");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const { data } = await api.put(
        `/bookings/${booking._id}/payment`,
        {
          transactionId,
        }
      );

      setMessage(data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to submit payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xl font-semibold text-slate-600">
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20 text-xl font-semibold text-red-500">
        Booking not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Complete Your Payment
        </h1>

        <p className="text-slate-500 mt-2">
          Secure your booking by completing the payment below.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-7">

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 h-fit">

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Booking Summary
          </h2>

          {/* Event */}
          <div className="mb-6">
            <p className="text-sm text-slate-500 mb-1">
              Event
            </p>

            <p className="text-lg font-bold text-slate-900">
              {booking.eventId.title}
            </p>
          </div>

          {/* Amount */}
          <div className="flex justify-between items-center py-5 border-y border-slate-200">

            <span className="text-slate-600 font-medium">
              Amount to Pay
            </span>

            <span className="text-2xl font-extrabold text-blue-600">
              ₹{booking.amount}
            </span>

          </div>

          {/* Booking ID */}
          <div className="mt-5">

            <p className="text-sm text-slate-500 mb-2">
              Booking ID
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-sm font-mono font-semibold text-slate-700 break-all">
                {booking._id}
              </p>
            </div>

          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">

            <h3 className="font-bold text-blue-900 mb-3">
              How to Pay
            </h3>

            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">

              <li>
                Scan the QR code using any UPI app.
              </li>

              <li>
                Complete the payment.
              </li>

              <li>
                Enter the UTR number below.
              </li>

              <li>
                Submit the payment for verification.
              </li>

            </ol>

          </div>

        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7">

          <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
            Scan & Pay
          </h2>

          {/* QR Code */}
          <div className="flex justify-center mb-6">

            <div className="p-4 border-2 border-slate-200 rounded-2xl bg-white shadow-sm">

              <img
                src={paymentQR}
                alt="UPI QR Code"
                className="w-56 h-56 object-contain"
              />

            </div>

          </div>

          {/* UPI ID */}
          <div className="mb-6">

            <p className="text-sm font-semibold text-slate-600 mb-2 text-center">
              Or pay using UPI ID
            </p>

            <div className="flex items-center gap-2">

              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono font-semibold text-slate-700 break-all">
                tushardhiman2011@okaxis
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    "tushardhiman2011@okaxis"
                  );

                  alert("UPI ID copied!");
                }}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                Copy
              </button>

            </div>

          </div>

          {/* UTR */}
          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              UTR / Transaction ID
            </label>

            <input
              type="text"
              value={transactionId}
              onChange={(e) =>
                setTransactionId(e.target.value)
              }
              placeholder="Enter UTR Number"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-center font-mono font-bold text-lg tracking-[0.2em] text-slate-800 placeholder:text-slate-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            <p className="text-xs text-slate-500 mt-2">
              Enter the UTR number shown in your UPI payment history.
            </p>

          </div>

          {/* Message */}
          {message && (
            <div className="mt-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-4 py-3 text-sm font-medium">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmitPayment}
            disabled={submitting}
            className={`w-full mt-6 py-3.5 rounded-xl font-bold transition shadow-md ${
              submitting
                ? "bg-slate-400 cursor-not-allowed text-white"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {submitting
              ? "Submitting..."
              : "Submit Payment"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default Payment;