import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialFormData = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "",
  totalSeats: "",
  ticketPrice: "",
  image: "",
};

const formatEventDate = (date) => {
  if (!date) return "Date not set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatEventTime = (time) => {
  if (!time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return "Time not set";
  }

  const [hours, minutes] = time.split(":").map(Number);
  const formattedDate = new Date();
  formattedDate.setHours(hours, minutes, 0, 0);

  return formattedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get("/events"),
        api.get("/bookings/my"),
      ]);

      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Unable to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchData();
  }, [user, navigate, fetchData]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      toast.error("Please select both event date and time");
      return;
    }

    const selectedDateTime = new Date(`${formData.date}T${formData.time}:00`);

    if (
      Number.isNaN(selectedDateTime.getTime()) ||
      selectedDateTime <= new Date()
    ) {
      toast.error("Event date and time must be in the future");
      return;
    }

    try {
      setCreating(true);

      await api.post("/events", {
        ...formData,
        totalSeats: Number(formData.totalSeats),
        ticketPrice: Number(formData.ticketPrice || 0),
      });

      toast.success("Event created successfully!");
      setShowEventForm(false);
      setFormData({ ...initialFormData });
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating event");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to archive this event? Its booking history will be preserved.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      toast.success("Event archived successfully");
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error archiving event");
    }
  };

  const handleUpdateBookingStatus = async (id, status, paymentStatus) => {
    try {
      await api.put(`/bookings/${id}/status`, {
        status,
        paymentStatus,
      });

      toast.success("Booking status updated");
      await fetchData();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(error.response?.data?.message || "Error updating booking");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xl font-semibold">
        Loading admin panel...
      </div>
    );
  }

  const totalRevenue = bookings.reduce(
    (sum, booking) =>
      booking.paymentStatus === "paid"
        ? sum + Number(booking.amount || 0)
        : sum,
    0,
  );

  const paidClients = new Set(
    bookings
      .filter(
        (booking) =>
          booking.paymentStatus === "paid" && booking.status === "confirmed",
      )
      .map((booking) => booking.userId?._id || booking.userId)
      .filter(Boolean)
      .map(String),
  ).size;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-base text-slate-500 mt-1 font-medium">
            Manage events, bookings and payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEventForm((previous) => !previous)}
          className="w-full md:w-auto bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition shadow-md"
        >
          {showEventForm ? "Cancel Creation" : "+ Create New Event"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h3 className="text-3xl font-black text-emerald-600">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
            ₹
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Paid Clients
            </p>
            <h3 className="text-3xl font-black text-blue-600">{paidClients}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
            👤
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Pending Requests
            </p>
            <h3 className="text-3xl font-black text-blue-600">
              {
                bookings.filter((booking) => booking.status === "pending")
                  .length
              }
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
            ⏳
          </div>
        </div>
      </div>

      {/* Create Event Form */}
      {showEventForm && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Create New Event
          </h2>

          <form
            onSubmit={handleCreateEvent}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <input
              required
              type="text"
              placeholder="Event Title"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <input
              required
              type="text"
              placeholder="Category (e.g., Tech, Music)"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Date
              </label>
              <input
                required
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Time
              </label>
              <input
                required
                type="time"
                className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>

            <input
              required
              type="text"
              placeholder="Location"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />

            <input
              required
              type="number"
              min="1"
              step="1"
              placeholder="Total Seats"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.totalSeats}
              onChange={(e) =>
                setFormData({ ...formData, totalSeats: e.target.value })
              }
            />

            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Ticket Price (0 for free)"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.ticketPrice}
              onChange={(e) =>
                setFormData({ ...formData, ticketPrice: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <input
                type="url"
                placeholder="Image URL (optional)"
                className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            <textarea
              required
              placeholder="Event Description"
              className="w-full border border-slate-300 px-4 py-3 rounded-lg md:col-span-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            <button
              type="submit"
              disabled={creating}
              className="md:col-span-2 bg-blue-600 text-white font-bold py-3 mt-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {creating ? "Publishing..." : "Publish Event"}
            </button>
          </form>
        </div>
      )}

      {/* Events and Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">
              {events.length}
            </span>
            All Events
          </h2>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {events.length === 0 ? (
                <li className="p-6 text-slate-500 text-center">
                  No events created yet.
                </li>
              ) : (
                events.map((event) => (
                  <li
                    key={event._id}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">
                        {event.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span>📅 {formatEventDate(event.date)}</span>
                        <span>🕒 {formatEventTime(event.time)}</span>
                        <span>
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              event.availableSeats > 0
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />
                          {event.availableSeats}/{event.totalSeats} seats
                        </span>
                      </div>

                      {event.isArchived && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-slate-200 text-slate-700">
                          Archived
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event._id)}
                      className="w-full sm:w-auto text-red-600 hover:text-white hover:bg-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Archive
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
              {bookings.length}
            </span>
            Booking Requests
          </h2>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {bookings.length === 0 ? (
                <li className="p-6 text-slate-500 text-center">
                  No bookings yet.
                </li>
              ) : (
                bookings.map((booking) => (
                  <li
                    key={booking._id}
                    className={`p-6 hover:bg-slate-50 transition border-l-4 ${
                      booking.status === "pending"
                        ? "border-l-blue-400"
                        : booking.status === "confirmed"
                          ? "border-l-emerald-400"
                          : "border-l-red-400"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {booking.eventId?.title || "Deleted Event"}
                      </h4>

                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`px-2 py-1 text-[10px] font-black rounded uppercase ${
                            booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {booking.status}
                        </span>

                        <span
                          className={`px-2 py-1 text-[10px] font-black rounded uppercase ${
                            booking.paymentStatus === "paid"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {booking.paymentStatus?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200 text-sm space-y-2">
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-500 mr-2">
                          User:
                        </span>
                        <span className="font-semibold">
                          {booking.userId?.name || "Unknown user"}
                        </span>
                        <span className="text-slate-400 ml-1">
                          ({booking.userId?.email || "No email"})
                        </span>
                      </p>

                      <p className="text-slate-700">
                        <span className="font-bold text-slate-500 mr-2">
                          Amount:
                        </span>
                        <span className="font-semibold">
                          {Number(booking.amount || 0) === 0
                            ? "Free"
                            : `₹${Number(booking.amount).toLocaleString("en-IN")}`}
                        </span>
                      </p>

                      <p className="text-slate-700">
                        <span className="font-bold text-slate-500 mr-2">
                          Payment ID:
                        </span>
                        <span className="font-semibold break-all">
                          {booking.razorpayPaymentId ||
                            booking.transactionId ||
                            "Not available"}
                        </span>
                      </p>

                      <p className="text-slate-700">
                        <span className="font-bold text-slate-500 mr-2">
                          Booked:
                        </span>
                        {booking.bookedAt
                          ? new Date(booking.bookedAt).toLocaleString("en-IN")
                          : booking.createdAt
                            ? new Date(booking.createdAt).toLocaleString(
                                "en-IN",
                              )
                            : "Not available"}
                      </p>

                      {booking.eventId && (
                        <p className="text-slate-700 mt-2 pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-500 mr-2">
                            Event seats:
                          </span>
                          <span
                            className={`font-bold ${
                              booking.eventId.availableSeats > 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {booking.eventId.availableSeats}
                          </span>{" "}
                          remaining of {booking.eventId.totalSeats}
                        </p>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {booking.status === "pending" && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {booking.paymentStatus === "verification_pending" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBookingStatus(
                                booking._id,
                                "confirmed",
                                "paid",
                              )
                            }
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                          >
                            ✓ Verify & Confirm
                          </button>
                        )}

                        {Number(booking.amount) === 0 &&
                          booking.paymentStatus !== "paid" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateBookingStatus(
                                  booking._id,
                                  "confirmed",
                                  "paid",
                                )
                              }
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                            >
                              ✓ Confirm Free Booking
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateBookingStatus(
                              booking._id,
                              "cancelled",
                              booking.paymentStatus,
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
