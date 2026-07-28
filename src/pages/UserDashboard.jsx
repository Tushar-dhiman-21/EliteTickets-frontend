import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaTimesCircle } from "react-icons/fa";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const response = await api.get("/bookings/my");

      const bookingsData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to cancel booking."
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xl font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
        <div className="w-20 h-20 bg-gray-200 text-gray-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>

          <p className="text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            User Dashboard
          </p>
        </div>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FaTicketAlt />
          My Booking Requests
        </h2>
      </div>

      {/* No Bookings */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTicketAlt className="text-gray-300 text-3xl" />
          </div>

          <p className="text-xl text-gray-500 mb-6">
            You haven't booked any events yet.
          </p>

          <Link
            to="/"
            className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow">
                {booking.eventId ? (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold">
                        {booking.eventId.title}
                      </h3>

                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`px-2 py-1 text-xs rounded font-bold uppercase ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>

                        {booking.status !== "cancelled" && (
                          <span
                            className={`px-2 py-1 text-xs rounded font-bold uppercase ${
                              booking.paymentStatus === "paid"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {booking.paymentStatus?.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Date:</strong>{" "}
                        {booking.eventId.date
                          ? new Date(
                              booking.eventId.date
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p>
                        <strong>Amount:</strong>{" "}
                        {booking.amount === 0
                          ? "Free"
                          : `₹${booking.amount}`}
                      </p>

                      <p>
                        <strong>Requested:</strong>{" "}
                        {booking.bookedAt
                          ? new Date(
                              booking.bookedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500 italic">
                    Event details unavailable.
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 flex justify-between items-center">
                {booking.eventId && booking.status !== "cancelled" ? (
                  <>
                    <Link
                      to={`/events/${booking.eventId._id}`}
                      className="text-gray-900 font-semibold hover:underline"
                    >
                      View Event
                    </Link>

                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <FaTimesCircle />
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-gray-500 italic">
                    Booking Cancelled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;