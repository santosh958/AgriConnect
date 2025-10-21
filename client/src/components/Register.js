import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    place: '',
    phone: ''
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', form);

      // Save details to localStorage
      localStorage.setItem("userName", form.name);
      localStorage.setItem("email", form.email);
      localStorage.setItem("place", form.place);
      localStorage.setItem("role", form.role);
      localStorage.setItem("farmer_id", res.data.farmer_id || "-");
      localStorage.setItem("buyer_id", res.data.buyer_id || "-");

      alert(`Registered ✅\nYour ID: ${res.data.farmer_id || "N/A"}`);
      alert(`Registered ✅\nYour ID: ${res.data.buyer_id || "N/A"}`);
    } catch (err) {
      alert("Registration failed ❌");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Register for AgriConnect</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Santosh Inavolu"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Place</label>
            <input
              type="text"
              name="place"
              placeholder="Guntur"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
              value={form.place}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Role</label>
            <select
              name="role"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
