import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaRegClock, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const loadEvents = async () => {
                try {
                    const { data } = await api.get(`/events?search=${search}`);
                    setEvents(data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadEvents();
        }, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [search]);

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <div className="relative bg-neutral-950 text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/40"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
                    <span className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-amber-400/20">
                        <FaTicketAlt /> Welcome to EliteTickets
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Find Your Next <br /><span className="text-transparent bg-clip-text bg-linear-to-r from-amber-300 to-amber-500">Unforgettable</span> Experience
                    </h1>
                    <p className="text-neutral-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the best tech conferences, late-night music festivals, and hands-on workshops happening directly in your area. Secure your spot today.
                    </p>

                    <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-6 text-neutral-400 text-xl group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-neutral-900 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-amber-400 focus:outline-none transition-all placeholder-neutral-400 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Why Choose Us / Features row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 transition duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-500/30">
                        <FaRegClock />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Fast Booking</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 transition duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-500/30">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Seamless Access</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">Download tickets instantly or manage them right from your personal dashboard with easily.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 transition duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-500/30">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Secure Platform</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2 border-b border-neutral-200 pb-4">
                <h2 className="text-3xl font-extrabold text-neutral-900">Upcoming Events</h2>
                <div className="text-neutral-500 font-medium">{events.length} results found</div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-neutral-600">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-neutral-500">No events found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-amber-500/10 transition flex flex-col border border-neutral-100">
                            <div className="h-48 bg-neutral-200 overflow-hidden relative">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-amber-400 font-bold text-2xl">
                                        {event.category || 'Event'}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {event.ticketPrice === 0 ? <span className="text-emerald-600">FREE</span> : <span className="text-neutral-900">₹{event.ticketPrice}</span>}
                                </div>
                            </div>
                            <div className="p-6 grow flex flex-col">
                                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">{event.category}</div>
                                <h2 className="text-xl font-bold text-neutral-800 mb-3">{event.title}</h2>
                                <div className="flex flex-col gap-2 mb-4 text-neutral-600 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-neutral-400" />
                                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-neutral-400" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                                        <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-4">{event.availableSeats} of {event.totalSeats} seats remaining</p>
                                    <Link to={`/events/${event._id}`} className="block w-full text-center bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2 rounded-lg transition">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Section */}
            <footer className="mt-auto pt-16 pb-8 border-t border-neutral-200 text-center">
                <div className="flex justify-center items-center gap-2.5 mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/20">
                        <FaTicketAlt className="text-base" />
                    </span>
                    <span className="text-xl font-bold tracking-tight text-neutral-900">
                        Elite<span className="text-amber-500">Tickets</span>
                    </span>
                </div>
                <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
                    The simplest, most dynamic way to manage, discover, and host world-class events in your local city. Let's make memories together.
                </p>
                <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} EliteTickets Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
