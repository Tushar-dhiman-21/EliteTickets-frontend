import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios.js";
import { AuthContext } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load event details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // Step 1: Send OTP
      if (!showOTP) {
        const { data } = await api.post("/bookings/send-otp");

        setShowOTP(true);
        setSuccessMsg(data.message || "OTP sent to your email.");
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      // Step 2: Verify OTP and create booking
      const { data } = await api.post("/bookings", {
        eventId: event._id,
        otp,
      });

      const booking = data.booking;

      if (!booking?._id) {
        throw new Error("Booking could not be created.");
      }

      setShowOTP(false);
      setOtp("");

      // Free event: backend confirms the booking directly
      if (Number(event.ticketPrice) === 0) {
        setSuccessMsg("Your free ticket is booked successfully!");
        return;
      }

      // Step 3: Load Razorpay Checkout
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        setError(
          "Unable to load Razorpay. Please check your internet and try again.",
        );
        return;
      }

      // Step 4: Create Razorpay order on backend
      const { data: orderData } = await api.post(
        `/bookings/${booking._id}/razorpay-order`,
      );

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EliteTickets",
        description: `Ticket for ${event.title}`,
        order_id: orderData.orderId,

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#2563eb",
        },

        handler: async (response) => {
          setBookingLoading(true);
          setError("");
          setSuccessMsg("");

          try {
            // Step 5: Verify payment on backend
            const { data: verifyData } = await api.post(
              `/bookings/${booking._id}/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            );

            if (verifyData.booking?.status === "confirmed") {
              setSuccessMsg(
                verifyData.emailSent
                  ? "Payment successful! Booking confirmed. Your ticket has been emailed."
                  : "Payment successful! Booking confirmed. Your ticket email could not be sent yet.",
              );

              setEvent((previous) =>
                previous
                  ? {
                      ...previous,
                      availableSeats: Math.max(0, previous.availableSeats - 1),
                    }
                  : previous,
              );
            } else {
              setError(
                "Payment received, but booking confirmation is pending. Please contact support.",
              );
            }
          } catch (verifyError) {
            setError(
              verifyError.response?.data?.message ||
                "Payment verification failed. Do not pay again immediately; contact support with your payment ID.",
            );
          } finally {
            setBookingLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setBookingLoading(false);
            setError(
              "Payment window closed. Your booking may still be pending; you can try payment again.",
            );
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        setBookingLoading(false);
        setError(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      checkout.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Booking failed. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xl font-semibold text-slate-600">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 text-xl text-red-500">
        {error || "Event not found"}
      </div>
    );
  }

  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-80 md:h-[430px] object-cover"
          />
        ) : (
          <div className="w-full h-80 md:h-[430px] bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <span className="text-white text-4xl md:text-5xl font-extrabold">
              {event.category}
            </span>
          </div>
        )}

        <div className="p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-5">
                {event.category}
              </span>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
                {event.title}
              </h1>

              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {event.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-bold text-slate-900">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-bold text-slate-900">{event.location}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaChair className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Seats Available</p>
                    <p className="font-bold text-slate-900">
                      {event.availableSeats} / {event.totalSeats}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaMoneyBillWave className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ticket Price</p>
                    <p className="font-bold text-slate-900">
                      {Number(event.ticketPrice) === 0
                        ? "FREE"
                        : `₹${event.ticketPrice}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full lg:w-96 h-fit">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Booking Details
              </h2>

              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                <span className="text-slate-500">Ticket Price</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  {Number(event.ticketPrice) === 0
                    ? "FREE"
                    : `₹${event.ticketPrice}`}
                </span>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="text-slate-500">Seats Available</span>
                <span className="font-bold text-slate-900">
                  {event.availableSeats}
                </span>
              </div>

              {showOTP && (
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Verification Code (OTP)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full border border-slate-300 rounded-xl p-3 text-center font-bold tracking-widest text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={
                  bookingLoading ||
                  isSoldOut ||
                  (showOTP && !/^\d{6}$/.test(otp))
                }
                className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white transition shadow-md ${
                  isSoldOut || bookingLoading
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {bookingLoading
                  ? "Processing..."
                  : isSoldOut
                    ? "Sold Out"
                    : showOTP
                      ? "Verify OTP & Continue"
                      : Number(event.ticketPrice) === 0
                        ? "Book Free Ticket"
                        : "Book & Pay"}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm text-center">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 text-sm text-center">
                  {successMsg}
                </div>
              )}

              {Number(event.ticketPrice) > 0 && (
                <p className="mt-4 text-xs text-slate-500 text-center">
                  Secure payment powered by Razorpay.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
