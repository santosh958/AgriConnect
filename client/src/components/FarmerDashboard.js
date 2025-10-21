import React, { useState, useEffect, useCallback } from 'react';
import AddCropForm from './AddCropForm';
import CropList from './CropList';
import FarmerOrders from './FarmerOrders';
import marketData from '../data/market_data_full_5000.json';
import CropPrediction from './CropPrediction';
import axios from 'axios';

function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [form, setForm] = useState({ type: '', name: '', state: '' });
  const [weather, setWeather] = useState(null);

  const user = {
    name: localStorage.getItem("userName") || "Farmer",
    email: localStorage.getItem("email") || "N/A",
    place: localStorage.getItem("place") || "N/A",
    farmer_id: localStorage.getItem("farmer_id") || "N/A"
  };

  const apiKey = '524901'; // 🟡 Replace this with your actual key

  const allTypes = [...new Set(marketData.map(d => d.type))];
  const allStates = [...new Set(marketData.map(d => d.state))];

  const fetchWeather = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${user.place}&appid=${apiKey}&units=metric`
      );
      setWeather(res.data);
    } catch (err) {
      console.error("Weather error ❌", err);
    }
  }, [user.place, apiKey]);

  useEffect(() => {
    setFilteredData(marketData);
    fetchWeather();
  }, [fetchWeather]);

  const handleSearch = () => {
    const results = marketData.filter(item =>
      (!form.type || item.type === form.type) &&
      (!form.state || item.state === form.state) &&
      (!form.name || item.name.toLowerCase().includes(form.name.toLowerCase()))
    );

    const map = new Map();
    results.forEach(item => {
      const key = `${item.name}_${item.state}`;
      if (!map.has(key) || item.price < map.get(key).price) {
        map.set(key, item);
      }
    });

    setFilteredData(Array.from(map.values()));
  };

  const resetFilters = () => {
    setForm({ type: '', name: '', state: '' });
    setFilteredData(marketData);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'add': return <AddCropForm />;
      case 'list': return <CropList />;
      case 'orders': return <FarmerOrders />;
      case 'predict': return <CropPrediction />;
      default:
        return (
          <div className="space-y-6">
            {/* Market Rates Panel */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <select name="type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border p-2 rounded">
                  <option value="">All Types</option>
                  {allTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
                <select name="state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="border p-2 rounded">
                  <option value="">All States</option>
                  {allStates.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <input type="text" placeholder="Crop Name" className="border p-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <button onClick={handleSearch} className="bg-green-600 text-white px-4 py-2 rounded">Search</button>
                <button onClick={resetFilters} className="bg-gray-400 px-4 py-2 rounded">Reset</button>
              </div>

              <div className="overflow-y-auto max-h-64">
                <table className="w-full text-left">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2">Type</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">State</th>
                      <th className="p-2">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{item.type}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.state}</td>
                        <td className="p-2">₹{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.length === 0 && <p className="text-center mt-2 text-gray-500">No results found.</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-green-700 text-white p-6 space-y-4 shadow-md">
        <h2 className="text-2xl font-bold mb-6">🌾 AgriConnect</h2>
        <button onClick={() => setActiveTab('dashboard')} className="block w-full text-left px-4 py-2 rounded hover:bg-green-600">Dashboard</button>
        <button onClick={() => setActiveTab('add')} className="block w-full text-left px-4 py-2 rounded hover:bg-green-600">Add Crop</button>
        <button onClick={() => setActiveTab('list')} className="block w-full text-left px-4 py-2 rounded hover:bg-green-600">My Crops</button>
        <button onClick={() => setActiveTab('orders')} className="block w-full text-left px-4 py-2 rounded hover:bg-green-600">Orders</button>
        <button onClick={() => setActiveTab('predict')} className="block w-full text-left px-4 py-2 rounded hover:bg-green-600">Crop Prediction</button>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-2xl font-semibold text-green-700">Farmer Dashboard</h1>

          {/* Avatar */}
          <div className="relative">
            <div
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-purple-600 text-white font-semibold flex items-center justify-center cursor-pointer"
            >
              {user.name.charAt(0)}
            </div>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 z-50">
                <div className="bg-gray-100 p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="p-4 text-sm space-y-2">
                  <p className="text-gray-600">📍 Place: {user.place}</p>
                  <p className="text-gray-600">🆔 ID: {user.farmer_id}</p>
                  <hr />
                  <button onClick={() => window.location.href = '/my-profile'} className="w-full text-left hover:text-green-700">👤 My Profile</button>
                  <button onClick={() => window.location.href = '/change-password'} className="w-full text-left hover:text-green-700">🔒 Change Password</button>
                  <button onClick={logout} className="w-full text-left text-red-600 hover:text-red-800">🚪 Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
export default FarmerDashboard;
