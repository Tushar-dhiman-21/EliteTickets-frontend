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
          err.response?.data?.error || "Failed to load event details."
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
      if (!showOTP) {
        const { data } = await api.post("/bookings/send-otp");
        setShowOTP(true);
        setSuccessMsg(data.message);
      } else {
        const { data } = await api.post("/bookings", {
          eventId: event._id,
          otp,
        });

        setShowOTP(false);
        setOtp("");

        if (data.booking.status === "confirmed") {
          setSuccessMsg("Booking confirmed successfully!");
        } else {
          navigate(`/payment/${data.booking._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed");
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

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

        {/* Event Image */}
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-80 md:h-107.5 object-cover"
          />
        ) : (
          <div className="w-full h-80 md:h-107.5 bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <span className="text-white text-4xl md:text-5xl font-extrabold">
              {event.category}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-10">

          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left Side */}
            <div className="flex-1">

              {/* Category */}
              <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-5">
                {event.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
                {event.title}
              </h1>

              {/* Description */}
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {event.description}
              </p>

              {/* Event Information */}
              <div className="grid sm:grid-cols-2 gap-4">

                {/* Date */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Date
                    </p>

                    <p className="font-bold text-slate-900">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Location
                    </p>

                    <p className="font-bold text-slate-900">
                      {event.location}
                    </p>
                  </div>
                </div>

                {/* Seats */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaChair className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Seats Available
                    </p>

                    <p className="font-bold text-slate-900">
                      {event.availableSeats} / {event.totalSeats}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaMoneyBillWave className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Ticket Price
                    </p>

                    <p className="font-bold text-slate-900">
                      {event.ticketPrice === 0
                        ? "FREE"
                        : `₹${event.ticketPrice}`}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side - Booking */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full lg:w-96 h-fit">

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Booking Details
              </h2>

              {/* Price */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                <span className="text-slate-500">
                  Ticket Price
                </span>

                <span className="text-2xl font-extrabold text-blue-600">
                  {event.ticketPrice === 0
                    ? "FREE"
                    : `₹${event.ticketPrice}`}
                </span>
              </div>

              {/* Seats */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-slate-500">
                  Seats Available
                </span>

                <span className="font-bold text-slate-900">
                  {event.availableSeats}
                </span>
              </div>

              {/* OTP */}
              {showOTP && (
                <div className="mt-5">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Verification Code (OTP)
                  </label>

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full border border-slate-300 rounded-xl p-3 text-center font-bold tracking-widest text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>
              )}

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={
                  bookingLoading ||
                  isSoldOut ||
                  (showOTP && !otp)
                }
                className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white transition shadow-md ${
                  isSoldOut
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {bookingLoading
                  ? "Processing..."
                  : isSoldOut
                  ? "Sold Out"
                  : showOTP
                  ? "Verify OTP & Book"
                  : event.ticketPrice === 0
                  ? "Book Free Ticket"
                  : "Book Event"}
              </button>

              {/* Error */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 text-sm text-center">
                  {successMsg}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
