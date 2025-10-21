import React from 'react';

function MyProfile() {
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("email");
  const place = localStorage.getItem("place");
  const farmer_id = localStorage.getItem("farmer_id");

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-green-700 mb-4">👤 My Profile</h2>
      <div className="space-y-2 text-gray-700">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Place:</strong> {place}</p>
        <p><strong>Farmer ID:</strong> {farmer_id}</p>
      </div>
    </div>
  );
}

export default MyProfile;
