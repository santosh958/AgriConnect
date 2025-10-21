import React, { useState } from 'react';
import axios from 'axios';

function ChangePassword() {
  const [form, setForm] = useState({ old: '', newp: '', confirm: '' });
  const user_id = localStorage.getItem("userId");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newp !== form.confirm) {
      alert("New passwords do not match ❌");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/change-password', {
        user_id,
        old_password: form.old,
        new_password: form.newp
      });
      alert(res.data.message || "Password changed ✅");
      setForm({ old: '', newp: '', confirm: '' });
    } catch (err) {
      alert("Error: " + err.response?.data || "Failed to change password");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-green-700 mb-4">🔒 Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="old"
          placeholder="Old Password"
          className="w-full p-2 border rounded"
          value={form.old}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="newp"
          placeholder="New Password"
          className="w-full p-2 border rounded"
          value={form.newp}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirm"
          placeholder="Confirm New Password"
          className="w-full p-2 border rounded"
          value={form.confirm}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
