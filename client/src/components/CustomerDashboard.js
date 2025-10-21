// pages/CustomerDashboard.jsx
import React, { useState } from 'react';
import CropMarket from './CropMarket';
import MyOrders from './MyOrders';
import CartPage from './CartPage';
import { useNavigate } from 'react-router-dom';

function CustomerDashboard() {
  const [tab, setTab] = useState('crops');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-green-700 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">AgriConnect</h2>
        <nav className="space-y-3">
          <button onClick={() => setTab('crops')} className={`block w-full text-left px-3 py-2 rounded ${tab === 'crops' ? 'bg-green-900' : 'hover:bg-green-600'}`}>
            🌾 All Crops
          </button>
          <button onClick={() => setTab('cart')} className={`block w-full text-left px-3 py-2 rounded ${tab === 'cart' ? 'bg-green-900' : 'hover:bg-green-600'}`}>
            🛒 My Cart
          </button>
          <button onClick={() => setTab('orders')} className={`block w-full text-left px-3 py-2 rounded ${tab === 'orders' ? 'bg-green-900' : 'hover:bg-green-600'}`}>
            🛍️ My Orders
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        {/* Header */}
        <div className="flex justify-end mb-6">
          <div className="relative">
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center cursor-pointer"
            >
              {userName[0]}
            </div>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow rounded text-sm z-50">
                <div className="p-2 border-b text-gray-700">Hi, {userName}</div>
                <button onClick={() => navigate('/profile')} className="w-full text-left p-2 hover:bg-gray-100">My Profile</button>
                <button onClick={() => navigate('/change-password')} className="w-full text-left p-2 hover:bg-gray-100">Change Password</button>
                <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-gray-100 text-red-600">Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        {tab === 'crops' && <CropMarket />}
        {tab === 'cart' && <CartPage />}
        {tab === 'orders' && <MyOrders />}
      </div>
    </div>
  );
}

export default CustomerDashboard;

