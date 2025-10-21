import React from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Calculate total price
  const total = cartItems.reduce(
    (acc, item) => acc + item.price_per_kg * item.quantity,
    0
  );

  // Navigate to checkout page
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return alert("Your cart is empty.");
    
    // Store cart items in localStorage for CheckoutPage
    localStorage.setItem("checkoutItems", JSON.stringify(cartItems));
    
    // Navigate to CheckoutPage
    navigate("/checkout");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item, index) => (
            <div key={index} className="border p-4 rounded shadow flex justify-between items-center">
              <div>
                <p><strong>{item.crop_name}</strong></p>
                <p>Price: ₹{item.price_per_kg} /kg</p>
                <div className="flex items-center gap-2 mt-1">
                  <label>Qty:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="border px-2 py-1 w-20"
                  />
                </div>
                <p>Total: ₹{item.price_per_kg * item.quantity}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600"
              >
                🗑 Remove
              </button>
            </div>
          ))}

          <hr />
          <p className="text-right font-semibold text-lg">
            Total: ₹{total}
          </p>

          <div className="flex justify-end gap-4 mt-4">
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handlePlaceOrder}
            >
              ✅ Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;

