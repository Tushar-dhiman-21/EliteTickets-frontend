import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaTimesCircle, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { toast } from "react-toastify";


const FONT_IMPORT_ID = "user-dashboard-fonts";

const useDashboardFonts = () => {
  useEffect(() => {
    if (document.getElementById(FONT_IMPORT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_IMPORT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
};

const STATUS_STYLES = {
  confirmed: { bg: "#E6F6EC", fg: "#1F7A46", dot: "#2F9E64" },
  cancelled: { bg: "#FBEAEE", fg: "#B33A52", dot: "#D6455B" },
  pending: { bg: "#FCF1DC", fg: "#9A6B14", dot: "#E4A33D" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
      style={{ backgroundColor: s.bg, color: s.fg, fontFamily: "'Inter', sans-serif" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  );
};

/* Perforated tear-line between ticket body and stub.
   The notch circles are painted in the page background color
   so they visually "punch through" the white card. */
const Perforation = () => (
  <div className="relative h-0">
    <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#F4F5FA]" />
    <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#F4F5FA]" />
    <div
      className="mx-6 border-t-2 border-dashed"
      style={{ borderColor: "#D8D9E4" }}
    />
  </div>
);

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

  if (loading) {
    return (
      <div
        className="text-center py-24 text-lg font-medium"
        style={{ fontFamily: "'Inter', sans-serif", color: "#171B34" }}
      >
        <div
          className="w-10 h-10 mx-auto mb-4 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: "#E4A33D transparent #E4A33D #E4A33D" }}
        />
        Loading your tickets…
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4"
      style={{ fontFamily: "'Inter', sans-serif", color: "#171B34" }}
    >
      {/* Profile Card */}
      <div
        className="relative rounded-2xl mb-10 overflow-hidden border"
        style={{ borderColor: "#E4E5EF" }}
      >
        <div
          className="h-20 sm:h-24 w-full"
          style={{
            background: "linear-gradient(135deg, #171B34 0%, #2A3163 100%)",
          }}
        />
        <div className="bg-white px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold uppercase shrink-0 border-4 border-white shadow-sm"
            style={{ backgroundColor: "#E4A33D", color: "#171B34" }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left pt-2">
            <h1
              className="text-2xl sm:text-3xl font-semibold mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm flex items-center justify-center sm:justify-start gap-2 text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2F9E64" }} />
              User Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl sm:text-2xl font-semibold flex items-center gap-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <FaTicketAlt style={{ color: "#E4A33D" }} />
          My Booking Requests
        </h2>
        {bookings.length > 0 && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#171B34", color: "#F4F5FA" }}
          >
            {bookings.length} total
          </span>
        )}
      </div>

      {/* No Bookings */}
      {bookings.length === 0 ? (
        <div
          className="rounded-2xl p-12 sm:p-16 text-center border-2 border-dashed"
          style={{ borderColor: "#D8D9E4", backgroundColor: "#FFFFFF" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#F4F5FA" }}
          >
            <FaTicketAlt className="text-3xl" style={{ color: "#C7C9D9" }} />
          </div>

          <p className="text-lg mb-6 text-gray-500">
            You haven't booked any events yet.
          </p>

          <Link
            to="/"
            className="inline-block font-semibold py-3 px-8 rounded-xl transition hover:opacity-90"
            style={{ backgroundColor: "#171B34", color: "#F4F5FA" }}
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-2xl bg-white border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "#E4E5EF" }}
            >
              <div className="p-6 flex-grow">
                {booking.eventId ? (
                  <>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <h3
                        className="text-lg font-semibold leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {booking.eventId.title}
                      </h3>
                      <StatusPill status={booking.status} />
                    </div>

                    <div
                      className="space-y-2.5 text-sm text-gray-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      <p className="flex items-center gap-2">
                        <FaRegCalendarAlt style={{ color: "#9A9CB0" }} />
                        {booking.eventId.date
                          ? new Date(booking.eventId.date).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p className="flex items-center gap-2">
                        <span style={{ color: "#9A9CB0" }}>₹</span>
                        {booking.amount === 0 ? "Free" : booking.amount}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaRegClock style={{ color: "#9A9CB0" }} />
                        {booking.bookedAt
                          ? new Date(booking.bookedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    {booking.status !== "cancelled" && (
                      <span
                        className="inline-block mt-4 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            booking.paymentStatus === "paid" ? "#E7EEFB" : "#F0F0F5",
                          color: booking.paymentStatus === "paid" ? "#2955A8" : "#6B6D80",
                        }}
                      >
                        {booking.paymentStatus?.replace("_", " ")}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="italic" style={{ color: "#D6455B" }}>
                    Event details unavailable.
                  </p>
                )}
              </div>

              <Perforation />

              <div className="p-4 flex justify-between items-center" style={{ backgroundColor: "#F9F9FC" }}>
                {booking.eventId && booking.status !== "cancelled" ? (
                  <>
                    <Link
                      to={`/events/${booking.eventId._id}`}
                      className="font-semibold text-sm hover:underline"
                      style={{ color: "#171B34" }}
                    >
                      View Event
                    </Link>

                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80"
                      style={{ color: "#D6455B" }}
                    >
                      <FaTimesCircle />
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-sm italic text-gray-400">
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
