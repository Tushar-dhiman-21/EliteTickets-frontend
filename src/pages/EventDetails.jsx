  import React, { useState, useEffect, useContext } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import api from "../utils/axios";
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
          setError(err.response?.data?.error || "Failed to load event details.");
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

          setSuccessMsg(data.message);
          setShowOTP(false);
          setOtp("");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Booking failed");
      } finally {
        setBookingLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="text-center py-20 text-xl font-semibold">
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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-80 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white text-5xl font-bold">
            {event.category}
          </div>
        )}

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">

            <div className="flex-1">
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-semibold">
                {event.category}
              </span>

              <h1 className="text-4xl font-bold mt-4 mb-4">
                {event.title}
              </h1>

              <p className="text-gray-600">
                {event.description}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border w-full md:w-96">

              <h2 className="text-2xl font-bold mb-6">
                Booking Details
              </h2>

              <div className="space-y-4">

                <div className="flex items-center gap-3">
                  <FaMoneyBillWave />
                  <span>
                    {event.ticketPrice === 0
                      ? "Free"
                      : `₹${event.ticketPrice}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FaChair />
                  <span>
                    {event.availableSeats} / {event.totalSeats}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FaCalendarAlt />
                  <span>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt />
                  <span>{event.location}</span>
                </div>

              </div>

              {showOTP && (
                <div className="mt-6">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="w-full border rounded-lg p-3 text-center"
                  />
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={bookingLoading || isSoldOut || (showOTP && !otp)}
                className="w-full bg-gray-900 text-white mt-6 py-3 rounded-lg hover:bg-black disabled:bg-gray-400"
              >
                {bookingLoading
                  ? "Processing..."
                  : showOTP
                  ? "Verify OTP"
                  : isSoldOut
                  ? "Sold Out"
                  : "Book Event"}
              </button>

              {error && (
                <p className="text-red-500 mt-4 text-center">
                  {error}
                </p>
              )}

              {successMsg && (
                <p className="text-green-600 mt-4 text-center">
                  {successMsg}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  export default EventDetail;