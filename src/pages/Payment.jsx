import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import paymentQR from "../assets/paymentQrCode.png";
import React from "react";
import { FaCopy, FaTicketAlt } from "react-icons/fa";

const Payment = () => {
    const { id } = useParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    const [transactionId, setTransactionId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get("/bookings/my");

                const currentBooking = data.find((booking) => booking._id === id);

                setBooking(currentBooking);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handleSubmitPayment = async () => {
        if (!transactionId.trim()) {
            setMessageType("error");
            setMessage("Please enter the Transaction ID (UTR).");
            return;
        }

        try {
            setSubmitting(true);

            const { data } = await api.put(`/bookings/${booking._id}/payment`, {
                transactionId,
            });

            setMessageType("success");
            setMessage(data.message);
        } catch (error) {
            setMessageType("error");
            setMessage(
                error.response?.data?.message || "Failed to submit payment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyUpi = () => {
        navigator.clipboard.writeText("tushardhiman2011@okaxis");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="text-center mt-20 text-xl text-neutral-600">
                Loading...
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center mt-20 text-red-500 text-xl font-semibold">
                Booking not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex justify-center items-center p-5">
            <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/60 border border-neutral-100 w-full max-w-md p-8">

                <div className="flex flex-col items-center mb-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/30 mb-4">
                        <FaTicketAlt className="text-xl" />
                    </span>
                    <h1 className="text-3xl font-bold text-neutral-900 text-center">
                        Complete Payment
                    </h1>
                </div>

                <div className="bg-neutral-50 rounded-xl border border-neutral-100 divide-y divide-neutral-100 mb-6">
                    <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-neutral-500">Event</span>
                        <span className="text-sm font-semibold text-neutral-900 text-right">{booking.eventId.title}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-neutral-500">Amount</span>
                        <span className="text-sm font-bold text-amber-600">₹{booking.amount}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-neutral-500">Booking ID</span>
                        <span className="text-xs font-mono text-neutral-700 break-all text-right ml-4">{booking._id}</span>
                    </div>
                </div>

                <img
                    src={paymentQR}
                    alt="UPI QR"
                    className="w-64 mx-auto rounded-lg shadow border border-neutral-100"
                />

                <div className="mt-6 text-center">
                    <p className="font-semibold text-neutral-800">UPI ID</p>

                    <div className="flex justify-center items-center gap-2 mt-2">
                        <span className="bg-neutral-100 px-3 py-2 rounded-lg text-sm text-neutral-700 font-mono">
                            tushardhiman2011@okaxis
                        </span>

                        <button
                            onClick={handleCopyUpi}
                            className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
                        >
                            <FaCopy className="text-xs" />
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block mb-2 font-semibold text-neutral-800 text-sm">
                        Enter Transaction ID (UTR)
                    </label>

                    <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter UTR Number"
                        className="w-full border border-neutral-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition outline-none"
                    />
                </div>

                <button
                    onClick={handleSubmitPayment}
                    disabled={
                        submitting || booking.paymentStatus === "verification_pending"
                    }
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold py-3 rounded-lg mt-6 hover:from-amber-300 hover:to-amber-400 transition shadow-md shadow-amber-500/20 disabled:bg-neutral-300 disabled:from-neutral-300 disabled:to-neutral-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {booking.paymentStatus === "verification_pending"
                        ? "Payment Verification Pending"
                        : submitting
                        ? "Submitting..."
                        : "Submit Payment"}
                </button>

                {message && (
                    <p
                        className={`text-center mt-4 text-sm font-medium ${
                            messageType === "error" ? "text-red-600" : "text-emerald-600"
                        }`}
                    >
                        {message}
                    </p>
                )}

            </div>
        </div>
    );
};

export default Payment;
