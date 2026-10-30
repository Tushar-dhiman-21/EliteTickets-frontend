import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/axios";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const Payment = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    let active = true;

    const fetchBooking = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/bookings/my");

        const bookings = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookings)
            ? data.bookings
            : [];

        const currentBooking = bookings.find(
          (item) => String(item._id) === String(id),
        );

        if (active) {
          setBooking(currentBooking || null);

          if (!currentBooking) {
            setMessage("Booking nahi mili. Please My Bookings check karo.");
            setMessageType("error");
          }
        }
      } catch (error) {
        if (active) {
          setMessage(
            error.response?.data?.message ||
              "Unable to load booking. Please login and try again.",
          );
          setMessageType("error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBooking();

    return () => {
      active = false;
    };
  }, [id]);

  const handlePayment = async () => {
    if (!booking || paying) return;

    if (booking.status === "cancelled") {
      setMessage("Cancelled booking ke liye payment nahi kar sakte.");
      setMessageType("error");
      return;
    }

    if (booking.paymentStatus === "paid") {
      setMessage("This booking has already been paid.");
      setMessageType("success");
      return;
    }

    if (
      !Number.isFinite(Number(booking.amount)) ||
      Number(booking.amount) <= 0
    ) {
      setMessage("Invalid payment amount. Please contact support.");
      setMessageType("error");
      return;
    }

    try {
      setPaying(true);
      setMessage("");
      setMessageType("info");

      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please try again.");
      }

      const { data: orderData } = await api.post(
        `/bookings/${booking._id}/razorpay-order`,
      );

      if (!orderData?.key || !orderData?.orderId) {
        throw new Error("Razorpay order details are missing.");
      }

      const checkout = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "EliteTickets",
        description: `Booking for ${booking.eventId?.title || "Event"}`,

        handler: async (paymentResponse) => {
          setMessage("Verifying your payment. Please wait...");
          setMessageType("info");

          try {
            const { data } = await api.post(
              `/bookings/${booking._id}/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
            );

            if (
              data?.booking?.paymentStatus === "paid" &&
              data?.booking?.status === "confirmed"
            ) {
              const emailSent = data.emailSent === true;

              window.location.assign(`/payment-success?emailSent=${emailSent}`);

              return;
            }

            setMessage(
              data?.message ||
                "Payment verification is pending. Please check your bookings.",
            );
            setMessageType("error");
          } catch (error) {
            setMessage(
              error.response?.data?.message ||
                "Payment verification could not be completed. Check your booking status before retrying.",
            );
            setMessageType("error");
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
            setMessage("Payment window closed. You can try again.");
            setMessageType("info");
          },
        },

        theme: {
          color: "#2563eb",
        },
      });

      checkout.on("payment.failed", (response) => {
        setPaying(false);
        setMessage(
          response.error?.description || "Payment failed. Please try again.",
        );
        setMessageType("error");
      });

      checkout.open();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment.",
      );
      setMessageType("error");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-lg font-semibold text-slate-700">
          Loading booking...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600">Booking not found</h2>

        {message && (
          <p className="mt-3 max-w-md text-sm text-slate-600">{message}</p>
        )}

        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === "paid";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Complete Your Payment
        </h1>

        <p className="mt-2 text-slate-500">
          Pay securely through Razorpay to complete your event booking.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 p-5 sm:p-6">
          <p className="text-sm text-slate-500">Event</p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {booking.eventId?.title || "Event"}
          </h2>

          {booking.eventId?.date && (
            <p className="mt-2 text-sm text-slate-500">
              {new Date(booking.eventId.date).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <span className="text-slate-600">Amount</span>

            <span className="text-2xl font-extrabold text-slate-900">
              ₹{Number(booking.amount).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-sm text-slate-500">Booking ID</p>
            <p className="mt-1 break-all font-mono text-sm text-slate-800">
              {booking._id}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm text-slate-500">Booking Status</p>
            <p
              className={`mt-1 font-bold ${
                isCancelled
                  ? "text-red-600"
                  : booking.status === "confirmed"
                    ? "text-green-600"
                    : "text-orange-600"
              }`}
            >
              {booking.status?.charAt(0).toUpperCase() +
                booking.status?.slice(1)}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500">Payment Status</p>
            <p
              className={`mt-1 font-bold ${
                isPaid ? "text-green-600" : "text-orange-600"
              }`}
            >
              {isPaid ? "Paid" : "Payment Pending"}
            </p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-5 rounded-xl border p-4 text-sm ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        {isPaid ? (
          <Link
            to="/payment-success"
            className="mt-6 block rounded-xl bg-green-600 py-3.5 text-center font-bold text-white transition hover:bg-green-700"
          >
            View Confirmation
          </Link>
        ) : isCancelled ? (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-center font-semibold text-red-700">
            This booking has been cancelled. Payment is disabled.
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePayment}
            disabled={paying}
            className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {paying
              ? "Processing..."
              : `Pay ₹${Number(booking.amount).toLocaleString("en-IN")} with Razorpay`}
          </button>
        )}

        <Link
          to="/dashboard"
          className="mt-5 block text-center font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Back to My Bookings
        </Link>
      </div>
    </div>
  );
};

export default Payment;
