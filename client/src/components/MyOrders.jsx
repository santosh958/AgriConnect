import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const buyerId = localStorage.getItem("buyer_id");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/my-orders?buyer_id=${buyerId}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  }, [buyerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const generateReceipt = (orderId) => {
    window.open(`http://localhost:5000/download-invoice/${orderId}`, "_blank");
  };

  console.log("Buyer ID from localStorage:", buyerId);

  // All stages for buyers to see
  const stages = [
    "Order Under Acceptance",
    "Order Accepted",
    "Order Packed",
    "Order Dispatched",
    "Booked with Delivery Partner",
    "Out for Delivery",
    "Delivered"
  ];

  const renderProgress = (currentStatus) => {
    const currentIndex = stages.indexOf(currentStatus);

    return (
      <div className="flex flex-col mt-2">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center mb-1">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                index <= currentIndex ? "bg-green-600" : "bg-gray-300"
              }`}
            ></div>
            <span
              className={`text-sm ${
                index <= currentIndex ? "text-green-700 font-semibold" : "text-gray-500"
              }`}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border p-4 rounded shadow mb-4 bg-white">
            <p>
              <strong>Crop:</strong> {order.crop_name}
            </p>
            <p>
              <strong>Farmer:</strong> {order.farmer_name}
            </p>
            <p>
              <strong>Quantity:</strong> {order.quantity} kg
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-semibold ${
                  order.status === "Delivered"
                    ? "text-green-600"
                    : order.status.includes("Rejected")
                    ? "text-red-500"
                    : "text-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p>
              <strong>Ordered On:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>

            {/* Progress Tracker */}
            {renderProgress(order.status)}

            {/* Download Invoice Button */}
            {order.status === "OrderAccepted" && (
              <button
                onClick={() => generateReceipt(order.id)}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Download Invoice
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;


