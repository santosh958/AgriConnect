// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import AddCrop from './components/AddCrop';
import FarmerDashboard from './components/FarmerDashboard';
import CropMarket from './components/CropMarket';
import MyOrders from './components/MyOrders';
import FarmerOrders from './components/FarmerOrders';
import Welcome from './components/Welcome';
import MyProfile from './components/MyProfile';
import ChangePassword from './components/ChangePassword';
import CustomerDashboard from './components/CustomerDashboard';
import CropPrediction from './components/CropPrediction';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Farmer */}
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/farmer-orders" element={<FarmerOrders />} />

        {/* Buyer */}
        <Route path="/crop-market" element={<CropMarket />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/buyer-dashboard" element={<CustomerDashboard />} />
        <Route path="/predict-crop" element={<CropPrediction />} />
        <Route path="/cart-page" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;


