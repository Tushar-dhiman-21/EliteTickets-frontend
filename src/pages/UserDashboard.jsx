import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";

/* ---------------------------------------------------------
   Design notes:
   - Palette: near-black bg #0B0E14, glass cards
     (translucent white + blur), gradient accent cyan→violet
     (#22D3EE → #8B5CF6), status glows: emerald/amber/rose
   - Display face: Sora (headings) / Body: Inter, tabular nums
   - Signature element: glass cards with a soft gradient glow
     ring, a monogram avatar per event, and status shown as a
     glowing dot + label rather than a solid pill.
   --------------------------------------------------------- */

const FONT_IMPORT_ID = "user-dashboard-fonts-v3";

const useDashboardFonts = () => {
  useEffect(() => {
    if (document.getElementById(FONT_IMPORT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_IMPORT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
};

const STATUS = {
  confirmed: { glow: "#34D399", label: "Confirmed" },
  cancelled: { glow: "#FB7185", label: "Cancelled" },
  pending: { glow: "#FBBF24", label: "Pending" },
};

const GlowDot = ({ color }) => (
  <span className="relative inline-flex w-2 h-2">
    <span
      className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
      style={{ backgroundColor: color }}
    />
    <span
      className="relative inline-flex w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  </span>
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
        className="min-h-[50vh] flex flex-col items-center justify-center text-lg"
        style={{ backgroundColor: "#0B0E14", color: "#E5E7EB", fontFamily: "'Inter', sans-serif" }}
      >
        <div
          className="w-9 h-9 mb-4 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#8B5CF6 transparent #22D3EE #8B5CF6" }}
        />
        Loading dashboard…
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 rounded-3xl"
      style={{ backgroundColor: "#0B0E14", color: "#E5E7EB", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Profile Card */}
      <div
        className="relative rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 overflow-hidden"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-20 blur-3xl"
          style={{ background: "linear-gradient(135deg, #22D3EE, #8B5CF6)" }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0"
          style={{
            background: "linear-gradient(135deg, #22D3EE, #8B5CF6)",
            color: "#0B0E14",
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="relative">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Welcome, {user?.name}!
          </h1>

          <p className="flex items-center justify-center sm:justify-start gap-2 text-sm" style={{ color: "#9CA3AF" }}>
            <GlowDot color="#34D399" />
            User Dashboard
          </p>
        </div>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl sm:text-2xl font-bold flex items-center gap-3"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          <FaTicketAlt style={{ color: "#8B5CF6" }} />
          My Booking Requests
        </h2>
      </div>

      {/* No Bookings */}
      {bookings.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <FaTicketAlt className="text-3xl" style={{ color: "#4B5563" }} />
          </div>

          <p className="text-xl mb-6" style={{ color: "#9CA3AF" }}>
            You haven't booked any events yet.
          </p>

          <Link
            to="/"
            className="inline-block font-bold py-3 px-8 rounded-xl transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #22D3EE, #8B5CF6)",
              color: "#0B0E14",
            }}
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const s = STATUS[booking.status] || STATUS.pending;

            return (
              <div
                key={booking._id}
                className="group relative rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 opacity-70"
                  style={{ background: `linear-gradient(90deg, ${s.glow}, transparent)` }}
                />

                <div className="p-6 flex-grow">
                  {booking.eventId ? (
                    <>
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold uppercase shrink-0"
                            style={{
                              background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.2))",
                              color: "#E5E7EB",
                            }}
                          >
                            {booking.eventId.title?.charAt(0)}
                          </div>
                          <h3
                            className="text-base font-semibold truncate"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                          >
                            {booking.eventId.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <GlowDot color={s.glow} />
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: s.glow }}
                        >
                          {s.label}
                        </span>

                        {booking.status !== "cancelled" && (
                          <span
                            className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)",
                              color: booking.paymentStatus === "paid" ? "#22D3EE" : "#9CA3AF",
                            }}
                          >
                            {booking.paymentStatus?.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm" style={{ color: "#9CA3AF" }}>
                        <p className="flex justify-between">
                          <span>Date</span>
                          <span style={{ color: "#E5E7EB", fontVariantNumeric: "tabular-nums" }}>
                            {booking.eventId.date
                              ? new Date(booking.eventId.date).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </p>

                        <p className="flex justify-between">
                          <span>Amount</span>
                          <span style={{ color: "#E5E7EB", fontVariantNumeric: "tabular-nums" }}>
                            {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
                          </span>
                        </p>

                        <p className="flex justify-between">
                          <span>Requested</span>
                          <span style={{ color: "#E5E7EB", fontVariantNumeric: "tabular-nums" }}>
                            {booking.bookedAt
                              ? new Date(booking.bookedAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="italic" style={{ color: "#FB7185" }}>
                      Event details unavailable.
                    </p>
                  )}
                </div>

                <div
                  className="p-4 flex justify-between items-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {booking.eventId && booking.status !== "cancelled" ? (
                    <>
                      <Link
                        to={`/events/${booking.eventId._id}`}
                        className="font-semibold text-sm hover:underline"
                        style={{ color: "#22D3EE" }}
                      >
                        View Event
                      </Link>

                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80"
                        style={{ color: "#FB7185" }}
                      >
                        <FaTimesCircle />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center text-sm italic" style={{ color: "#6B7280" }}>
                      Booking Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
