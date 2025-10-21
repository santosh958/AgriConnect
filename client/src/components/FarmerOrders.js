import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const farmerId = localStorage.getItem("farmer_id");

  const stages = [
    "Order Under Acceptance",
    "Order Accepted",
    "Order Packed",
    "Order Dispatched",
    "Booked with Delivery Partner",
    "Out for Delivery",
    "Delivered"
  ];

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/farmer-orders?farmer_id=${farmerId}`
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching farmer orders", err);
    }
  }, [farmerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const progressOrder = async (orderId) => {
    try {
      await axios.post("http://localhost:5000/progress-order", {
        order_id: orderId
      });
      fetchOrders();
    } catch (err) {
      console.error("Error progressing order", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Farmer Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => {
          const currentIndex = stages.indexOf(order.status);
          const canProgress =
            currentIndex >= 0 && currentIndex < 3; // farmer only controls first 3 stages

          return (
            <div key={order.id} className="border p-4 rounded shadow mb-4">
              <p><strong>Buyer:</strong> {order.buyer_name}</p>
              <p><strong>Crop:</strong> {order.crop_name}</p>
              <p><strong>Quantity:</strong> {order.quantity} kg</p>
              <p><strong>Status:</strong> {order.status}</p>

              {canProgress && (
                <button
                  onClick={() => progressOrder(order.id)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Move to: {stages[currentIndex + 1]}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default FarmerOrders;
