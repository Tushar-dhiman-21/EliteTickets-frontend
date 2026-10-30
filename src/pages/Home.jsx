import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaTicketAlt,
} from "react-icons/fa";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/events", {
          params: { search: search.trim() },
        });

        if (!isActive) return;

        // Supports APIs returning either an array or { events: [...] }
        const eventList = Array.isArray(data)
          ? data
          : Array.isArray(data?.events)
            ? data.events
            : null;

        if (!eventList) {
          throw new Error("Invalid events response from server.");
        }

        setEvents(eventList);
      } catch (err) {
        if (!isActive) return;

        console.error("Error fetching events:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load events. Please try again."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [search]);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')",
          }}
        />

        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 p-6 sm:p-10 md:p-20 text-center flex flex-col items-center">
          <span className="bg-blue-500/20 text-blue-200 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-7 border border-blue-400/30">
            Welcome to EliteTickets
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6">
            From The First Click To The Final Moment.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-400">
              Make Every Event Unforgettable.
            </span>
          </h1>

          <p className="text-slate-200/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Find concerts, conferences, workshops and unforgettable events
            happening around you. Book your tickets quickly and securely.
          </p>

          {/* Search */}
          <div className="w-full max-w-2xl relative group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-blue-500 transition-colors" />

            <input
              type="text"
              placeholder="Search events by title..."
              aria-label="Search events by title"
              className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-slate-900 bg-white border-2 border-transparent focus:border-blue-500 focus:outline-none shadow-2xl transition-all placeholder-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 px-2 border-b border-slate-200 pb-4 mt-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Upcoming Events
        </h2>

        <div className="text-slate-500 font-medium">
          {events.length} results found
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xl font-semibold text-slate-600">
          Loading events...
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            type="button"
            onClick={() => {
              setSearch((current) => `${current} `);
              setSearch((current) => current.trim());
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-xl text-slate-500">
          No events found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const totalSeats = Math.max(0, Number(event.totalSeats) || 0);
            const availableSeats = Math.min(
              totalSeats,
              Math.max(0, Number(event.availableSeats) || 0)
            );

            const seatPercentage =
              totalSeats > 0
                ? (availableSeats / totalSeats) * 100
                : 0;

            const ticketPrice = Number(event.ticketPrice);

            return (
              <div
                key={event._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col border border-slate-200"
              >
                {/* Event Image */}
                <div className="h-48 bg-slate-100 overflow-hidden relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title || "Event"}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold text-2xl">
                      {event.category || "Event"}
                    </div>
                  )}

                  {/* Price */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-md border border-slate-200">
                    {ticketPrice === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <span className="text-blue-600">
                        ₹{Number.isFinite(ticketPrice) ? ticketPrice : "N/A"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 grow flex flex-col">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    {event.category || "Event"}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-3">
                    {event.title}
                  </h2>

                  {/* Event Information */}
                  <div className="flex flex-col gap-2 mb-4 text-slate-600 text-sm">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500 shrink-0" />
                      <span>
                        {event.date && !Number.isNaN(new Date(event.date).getTime())
                          ? new Date(event.date).toLocaleDateString(undefined, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date not available"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500 shrink-0" />
                      <span>{event.location || "Location not available"}</span>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="mt-auto">
                    <div
                      className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden"
                      role="progressbar"
                      aria-label="Available seats"
                      aria-valuemin={0}
                      aria-valuemax={totalSeats}
                      aria-valuenow={availableSeats}
                    >
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${seatPercentage}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-500 mb-4">
                      {availableSeats} of {totalSeats} seats remaining
                    </p>

                    <Link
                      to={`/events/${event._id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-12 pb-8 border-t border-slate-200 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <FaTicketAlt className="text-blue-600 text-2xl" />
          <span className="text-xl font-bold text-slate-900">
            Elite<span className="text-blue-600">Tickets</span>
          </span>
        </div>

        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          The simplest and most dynamic way to discover, manage, and host
          amazing events in your city. Let's make memories together.
        </p>

        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          &copy; {new Date().getFullYear()} EliteTickets Platform. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
