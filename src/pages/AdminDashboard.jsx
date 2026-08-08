import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showEventForm, setShowEventForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    totalSeats: "",
    ticketPrice: "",
    image: "",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get("/events"),
        api.get("/bookings/my"), // Admin gets all bookings
      ]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/events", formData);
      setShowEventForm(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        totalSeats: "",
        ticketPrice: "",
        image: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating event");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/events/${id}`);
        fetchData();
      } catch (error) {
        toast.error("Error deleting event");
      }
    }
  };

  const handleUpdateBookingStatus = async (id, status, paymentStatus) => {
    try {
      await api.put(`/bookings/${id}/status`, {
        status,
        paymentStatus,
      });

      fetchData();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error updating booking");
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold">
        Loading admin panel...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="text-base text-slate-500 mt-1 font-medium">
            Manage events and manually confirm bookings.
          </p>
        </div>

        <button
          onClick={() => setShowEventForm(!showEventForm)}
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
              ₹
              {bookings.reduce(
                (sum, b) =>
                  b.paymentStatus === "paid" && b.status === "confirmed"
                    ? sum + b.amount
                    : sum,
                0,
              )}
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

            <h3 className="text-3xl font-black text-blue-600">
              {
                new Set(
                  bookings
                    .filter(
                      (b) =>
                        b.paymentStatus === "paid" && b.status === "confirmed",
                    )
                    .map((b) => b.userId?._id),
                ).size
              }
            </h3>
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
              {bookings.filter((b) => b.status === "pending").length}
            </h3>
          </div>

          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
            ⏳
          </div>
        </div>
      </div>

      {/* Create Event */}
      {showEventForm && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
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
              className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <input
              required
              type="text"
              placeholder="Category (e.g., Tech, Music)"
              className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />

            <input
              required
              type="date"
              className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />

            <input
              required
              type="text"
              placeholder="Location"
              className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />

            <input
              required
              type="number"
              placeholder="Total Seats"
              className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.totalSeats}
              onChange={(e) =>
                setFormData({ ...formData, totalSeats: e.target.value })
              }
            />

            <input
              required
              type="number"
              placeholder="Ticket Price (0 for free)"
              className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.ticketPrice}
              onChange={(e) =>
                setFormData({ ...formData, ticketPrice: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Image URL"
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
              className="border border-slate-300 px-4 py-3 rounded-lg md:col-span-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="md:col-span-2 bg-blue-600 text-white font-bold py-3 mt-2 rounded-lg hover:bg-blue-700 transition"
            >
              Publish Event
            </button>
          </form>
        </div>
      )}

      {/* Events + Bookings */}
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
            <ul className="divide-y divide-slate-100 max-h-150 overflow-y-auto">
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
                      <h4 className="font-bold text-slate-900 mb-1">
                        {event.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {new Date(event.date).toLocaleDateString()}
                        </span>

                        <span className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              event.availableSeats > 0
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                          {event.availableSeats}/{event.totalSeats} seats
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Delete
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
            <ul className="divide-y divide-slate-100 max-h-150 overflow-y-auto">
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
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {booking.eventId?.title || "Deleted Event"}
                      </h4>

                      <div className="flex flex-col gap-1 items-end ml-4">
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

                        {booking.status !== "cancelled" && (
                          <span
                            className={`px-2 py-1 text-[10px] font-black rounded uppercase ${
                              booking.paymentStatus === "paid"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {booking.paymentStatus?.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200 text-sm">
                      <p className="text-slate-700 mb-1">
                        <span className="font-bold text-slate-500 mr-2">
                          User:
                        </span>
                        <span className="font-semibold">
                          {booking.userId?.name}
                        </span>
                        <span className="text-slate-400 ml-1">
                          ({booking.userId?.email})
                        </span>
                      </p>

                      <p className="text-slate-700 mb-1">
                        <span className="font-bold text-slate-500 mr-2">
                          Amount:
                        </span>

                        <span
                          className={
                            booking.amount === 0
                              ? "font-semibold text-emerald-600"
                              : "font-semibold"
                          }
                        >
                          {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
                        </span>
                      </p>

                      <p className="text-slate-700 mb-1">
                        <span className="font-bold text-slate-500 mr-2">
                          UTR:
                        </span>

                        <span className="font-semibold">
                          {booking.transactionId || "Not Submitted"}
                        </span>
                      </p>

                      <p className="text-slate-700 mb-1">
                        <span className="font-bold text-slate-500 mr-2">
                          Date:
                        </span>

                        <span>
                          {new Date(booking.bookedAt).toLocaleString()}
                        </span>
                      </p>

                      {booking.eventId && (
                        <p className="text-slate-700 mt-2 pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-500 mr-2">
                            Seats:
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

                        {booking.amount === 0 &&
                          booking.paymentStatus !== "paid" && (
                            <button
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
