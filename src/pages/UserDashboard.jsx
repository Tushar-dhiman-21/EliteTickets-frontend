import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";

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
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to cancel booking."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Welcome, {user?.name}!
            </h1>

            <p className="text-slate-500 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              User Dashboard
            </p>
          </div>

        </div>
      </div>


      {/* Heading */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
          <FaTicketAlt className="text-blue-600" />
          My Booking Requests
        </h2>

      </div>


      {/* No Bookings */}
      {bookings.length === 0 ? (

        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">

          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTicketAlt className="text-blue-600 text-3xl" />
          </div>

          <p className="text-xl text-slate-500 mb-6">
            You haven't booked any events yet.
          </p>

          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
          >
            Browse Events
          </Link>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {bookings.map((booking) => (

            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition"
            >

              <div className="p-6 flex-grow">

                {booking.eventId ? (
                  <>

                    <div className="flex justify-between items-start mb-4">

                      <h3 className="text-lg font-bold text-slate-900">
                        {booking.eventId.title}
                      </h3>

                      <div className="flex flex-col gap-1 items-end">

                        {/* Booking Status */}
                        <span
                          className={`px-2 py-1 text-xs rounded font-bold uppercase ${
                            booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {booking.status}
                        </span>

                        {/* Payment Status */}
                        {booking.status !== "cancelled" && (
                          <span
                            className={`px-2 py-1 text-xs rounded font-bold uppercase ${
                              booking.paymentStatus === "paid"
                                ? "bg-blue-100 text-blue-700"
                                : booking.paymentStatus ===
                                  "verification_pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {booking.paymentStatus?.replace("_", " ")}
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Booking Details */}
                    <div className="space-y-3 text-sm text-slate-500">

                      <p>
                        <strong className="text-slate-700">
                          Date:
                        </strong>{" "}
                        {booking.eventId.date
                          ? new Date(
                              booking.eventId.date
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p>
                        <strong className="text-slate-700">
                          Amount:
                        </strong>{" "}
                        <span
                          className={
                            booking.amount === 0
                              ? "text-emerald-600 font-semibold"
                              : "text-slate-700 font-semibold"
                          }
                        >
                          {booking.amount === 0
                            ? "Free"
                            : `₹${booking.amount}`}
                        </span>
                      </p>

                      <p>
                        <strong className="text-slate-700">
                          Requested:
                        </strong>{" "}
                        {booking.bookedAt
                          ? new Date(
                              booking.bookedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                      {booking.transactionId && (
                        <p>
                          <strong className="text-slate-700">
                            UTR:
                          </strong>{" "}
                          <span className="font-mono text-slate-600">
                            {booking.transactionId}
                          </span>
                        </p>
                      )}

                    </div>

                  </>
                ) : (

                  <p className="text-red-500 italic">
                    Event details unavailable.
                  </p>

                )}

              </div>


              {/* Footer */}
              <div className="p-4 bg-slate-50 flex justify-between items-center border-t border-slate-200">

                {booking.eventId && booking.status !== "cancelled" ? (
                  <>

                    <Link
                      to={`/events/${booking.eventId._id}`}
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      View Event
                    </Link>

                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold"
                    >
                      <FaTimesCircle />
                      Cancel
                    </button>

                  </>
                ) : (

                  <div className="w-full text-center text-slate-400 italic">
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
