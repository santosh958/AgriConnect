import React, { useState } from "react";
import { useCart } from "../components/CartContext";
import axios from "axios";

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [step, setStep] = useState(1);

  // Address state
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    pincode: "",
    flat: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");

  // Total
  const total = cartItems.reduce(
    (acc, item) => acc + item.price_per_kg * item.quantity,
    0
  );

  // Geolocation autofill
  const handleAutofill = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setAddress((prev) => ({
            ...prev,
            city: data.address.city || data.address.town || "",
            street: data.address.road || "",
            landmark: data.address.suburb || "",
            state: data.address.state || "",
            pincode: data.address.postcode || "",
          }));
        } catch (err) {
          console.error("Geolocation error:", err);
        }
      });
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handlePlaceOrder = async () => {
  const buyerId = localStorage.getItem("buyer_id");
  if (!buyerId) return alert("Login first.");

  const items = cartItems.map((item) => ({
    farmer_id: item.farmer_id,
    crop_id: item.id,
    quantity: parseInt(item.quantity),
  }));

  try {
    await axios.post("http://localhost:5000/place-group-order", {
      buyer_id: buyerId, // ✅ send buyer ID from frontend
      items,
      customer_name: address.fullName, // ✅ backend expects customer_name
      shipping_address: `${address.flat}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}`, // ✅ backend expects one string
      payment_method: paymentMethod, // ✅ backend expects payment_method
    });

    alert("Order placed successfully!");
    clearCart();
    setStep(4); // Confirmation step
  } catch (err) {
    console.error(err);
    alert("Failed to place order.");
  }
};

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Checkout</h2>

      {/* Step Indicators */}
      <div className="flex gap-4 mb-4">
        <span className={`px-3 py-1 rounded ${step === 1 ? "bg-green-600 text-white" : "bg-gray-300"}`}>1. Delivery</span>
        <span className={`px-3 py-1 rounded ${step === 2 ? "bg-green-600 text-white" : "bg-gray-300"}`}>2. Payment</span>
        <span className={`px-3 py-1 rounded ${step === 3 ? "bg-green-600 text-white" : "bg-gray-300"}`}>3. Review</span>
      </div>

      {/* Step 1: Delivery Address */}
      {step === 1 && (
        <div className="space-y-4 border p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Delivery Address</h3>

          <button
            className="bg-blue-600 text-white px-3 py-1 rounded mb-2"
            onClick={handleAutofill}
          >
            Autofill Current Location
          </button>

          {/* Full Name */}
          <div className="mb-3">
            <label className="block font-medium mb-1">Enter your name:</label>
            <input
              type="text"
              placeholder="Full Name"
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Mobile */}
          <div className="mb-3">
            <label className="block font-medium mb-1">Mobile Number:</label>
            <input
              type="text"
              placeholder="Enter mobile number"
              value={address.mobile}
              onChange={(e) => setAddress({ ...address, mobile: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* PIN */}
          <div className="mb-3">
            <label className="block font-medium mb-1">PIN Code:</label>
            <input
              type="text"
              placeholder="6-digit PIN code"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Flat / Street */}
          <div className="mb-3">
            <label className="block font-medium mb-1">Flat / House / Building:</label>
            <input
              type="text"
              placeholder="Flat, House, Building"
              value={address.flat}
              onChange={(e) => setAddress({ ...address, flat: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">Street / Area:</label>
            <input
              type="text"
              placeholder="Street, Area, Sector, Village"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">Landmark (optional):</label>
            <input
              type="text"
              placeholder="E.g., near Apollo Hospital"
              value={address.landmark}
              onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">City:</label>
            <input
              type="text"
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">State:</label>
            <input
              type="text"
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Method */}
      {step === 2 && (
        <div className="space-y-4 border p-4 rounded shadow">
          <h3 className="font-semibold">Payment Method</h3>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod("Card")}
              className={`w-full text-left px-3 py-2 border rounded ${paymentMethod === "Card" ? "bg-green-100" : ""}`}
            >
              Credit / Debit Card
            </button>
            <button
              onClick={() => setPaymentMethod("UPI")}
              className={`w-full text-left px-3 py-2 border rounded ${paymentMethod === "UPI" ? "bg-green-100" : ""}`}
            >
              UPI
            </button>
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`w-full text-left px-3 py-2 border rounded ${paymentMethod === "COD" ? "bg-green-100" : ""}`}
            >
              Cash on Delivery
            </button>
          </div>

          {paymentMethod === "Card" && (
            <div className="space-y-2 mt-2">
              <input
                placeholder="Card Number"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                placeholder="Expiry (MM/YY)"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                placeholder="CVV"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>
          )}

          {paymentMethod === "UPI" && (
            <input
              placeholder="Enter UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="border p-2 w-full rounded mt-2"
            />
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setStep(3)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Place Order */}
      {step === 3 && (
        <div className="space-y-4 border p-4 rounded shadow">
          <h3 className="font-semibold">Review Items & Shipping</h3>
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <div>
                  <p>{item.crop_name}</p>
                  <p>{item.quantity} kg x ₹{item.price_per_kg}</p>
                </div>
                <p>₹{item.quantity * item.price_per_kg}</p>
              </div>
            ))}
          </div>

          <p className="font-semibold mt-2">Delivery Address:</p>
          <p>{`${address.fullName}, ${address.flat}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}`}</p>

          <p className="font-semibold mt-2">Payment Method: {paymentMethod}</p>

          <p className="text-right font-bold text-lg">Total: ₹{total}</p>

          <div className="flex justify-end mt-4">
            <button
              onClick={handlePlaceOrder}
              className="bg-green-700 text-white px-4 py-2 rounded"
            >
              ✅ Place Order
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="text-center p-6 border rounded shadow">
          <h3 className="text-2xl font-bold mb-2">🎉 Order Placed!</h3>
          <p>Thank you for your purchase. Your order has been sent to the farmer.</p>
          <p className="mt-2">You will receive a confirmation email shortly.</p>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
