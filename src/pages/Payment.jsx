    import { useEffect, useState } from "react";
    import { useParams } from "react-router-dom";
    import api from "../utils/axios";
    import paymentQR from "../assets/paymentQrCode.png";
    import React from "react";

    const Payment = () => {
    const { id } = useParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

        const [transactionId, setTransactionId] = useState("");
const [submitting, setSubmitting] = useState(false);
const [message, setMessage] = useState("");


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
    setMessage("Please enter the Transaction ID (UTR).");
    return;
  }

  try {
    setSubmitting(true);

    const { data } = await api.put(`/bookings/${booking._id}/payment`, {
      transactionId,
    });

    setMessage(data.message);
  } catch (error) {
    setMessage(
      error.response?.data?.message || "Failed to submit payment."
    );
  } finally {
    setSubmitting(false);
  }
};


    if (loading) {
    return (
        <div className="text-center mt-20 text-xl">
        Loading...
        </div>
    );
    }

    if (!booking) {
    return (
        <div className="text-center mt-20 text-red-500">
        Booking not found
        </div>
    );
    }

    return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-center mb-6">
            Complete Payment
        </h1>

        <p className="mb-2">
            <strong>Event:</strong> {booking.eventId.title}
        </p>

        <p className="mb-2">
            <strong>Amount:</strong> ₹{booking.amount}
        </p>

        <p className="mb-6 break-all">
            <strong>Booking ID:</strong> {booking._id}
        </p>

        <img
            src={paymentQR}
            alt="UPI QR"
            className="w-64 mx-auto rounded-lg shadow"
        />
        <div className="mt-6 text-center">
  <p className="font-semibold">UPI ID</p>

  <div className="flex justify-center items-center gap-2 mt-2">
    <span className="bg-gray-100 px-3 py-2 rounded">
      tushardhiman2011@okaxis
    </span>

    <button
      onClick={() => {
        navigator.clipboard.writeText("tushardhiman2011@okaxis");
        alert("UPI ID copied!");
      }}
      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
    >
      Copy
    </button>
  </div>
</div>


<div className="mt-6">
  <label className="block mb-2 font-semibold">
    Enter Transaction ID (UTR)
  </label>

  <input
    type="text"
    value={transactionId}
    onChange={(e) => setTransactionId(e.target.value)}
    placeholder="Enter UTR Number"
    className="w-full border rounded-lg p-3"
  />
</div>
<button
  onClick={handleSubmitPayment}
  disabled={
    submitting || booking.paymentStatus === "verification_pending"
  }
  className="w-full bg-green-600 text-white py-3 rounded-lg mt-6 hover:bg-green-700 disabled:bg-gray-400"
>
  {booking.paymentStatus === "verification_pending"
    ? "Payment Verification Pending"
    : submitting
    ? "Submitting..."
    : "Submit Payment"}
</button>
{message && (
  <p className="text-center text-green-600 mt-4">
    {message}
  </p>
)}

        </div>
    </div>
    );
    };

    export default Payment;
