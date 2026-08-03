import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaTimesCircle, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";



const FONT_IMPORT_ID = "user-dashboard-fonts-v2";

const useDashboardFonts = () => {
  useEffect(() => {
    if (document.getElementById(FONT_IMPORT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_IMPORT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
  }, []);
};

const STATUS_COLORS = {
  confirmed: "#2F7D6B",
  cancelled: "#B5493F",
  pending: "#C08A2E",
};

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useDashboardFonts();

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

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const activeCount = bookings.filter((b) => b.status !== "cancelled").length;

  if (loading) {
    return (
      <div
        className="text-center py-24 text-lg"
        style={{ fontFamily: "'Inter', sans-serif", color: "#23262B" }}
      >
        <div
          className="w-8 h-8 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#2F7D6B transparent #2F7D6B #2F7D6B" }}
        />
        Fetching your reservations…
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto px-4"
      style={{ fontFamily: "'Inter', sans-serif", color: "#23262B" }}
    >
      {/* Profile Bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-8 mb-8 border-b-2"
        style={{ borderColor: "#23262B" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold uppercase"
            style={{ backgroundColor: "#23262B", color: "#F7F5F2" }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {user?.name}
            </h1>
            <p className="text-sm text-gray-500">Your reservation history</p>
          </div>
        </div>

        <div className="flex gap-8" style={{ fontFamily: "'Space Mono', monospace" }}>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#2F7D6B" }}>
              {confirmedCount}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              Confirmed
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              Active
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {bookings.length}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              Total
            </div>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="flex items-center gap-3 mb-5">
        <FaTicketAlt style={{ color: "#2F7D6B" }} />
        <h2
          className="text-lg font-bold uppercase tracking-wide"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Booking Requests
        </h2>
      </div>

      {/* No Bookings */}
      {bookings.length === 0 ? (
        <div
          className="py-20 text-center border-t border-b"
          style={{ borderColor: "#E3E1DA" }}
        >
          <p className="text-lg mb-6 text-gray-500">
            You haven't booked any events yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-full transition hover:opacity-90"
            style={{ backgroundColor: "#23262B", color: "#F7F5F2" }}
          >
            Browse Events <FaArrowRight className="text-xs" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: "#E3E1DA" }}>
          {bookings.map((booking) => {
            const railColor = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;

            return (
              <div
                key={booking._id}
                className="flex items-stretch gap-5 py-5"
                style={{ borderColor: "#E3E1DA" }}
              >
                {/* Status rail */}
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{ backgroundColor: railColor }}
                />

                {booking.eventId ? (
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-base font-bold truncate"
                          style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                          {booking.eventId.title}
                        </h3>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ color: railColor, backgroundColor: `${railColor}1A` }}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div
                        className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        <span>
                          {booking.eventId.date
                            ? new Date(booking.eventId.date).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span>
                          {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
                        </span>
                        <span>
                          requested{" "}
                          {booking.bookedAt
                            ? new Date(booking.bookedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                        {booking.status !== "cancelled" && (
                          <span
                            className="uppercase"
                            style={{
                              color:
                                booking.paymentStatus === "paid" ? "#2F7D6B" : "#9A9A9A",
                            }}
                          >
                            {booking.paymentStatus?.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {booking.status !== "cancelled" ? (
                        <>
                          <Link
                            to={`/events/${booking.eventId._id}`}
                            className="text-sm font-semibold hover:underline whitespace-nowrap"
                            style={{ color: "#23262B" }}
                          >
                            View Event
                          </Link>
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70 whitespace-nowrap"
                            style={{ color: "#B5493F" }}
                          >
                            <FaTimesCircle />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <span className="text-sm italic text-gray-400 whitespace-nowrap">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="italic flex-1" style={{ color: "#B5493F" }}>
                    Event details unavailable.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
