import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('/tree-bg.jpg')`,
      }}
    >
      {/* Overlay blur background */}
      <div className="bg-black bg-opacity-60 backdrop-blur-sm p-10 rounded-2xl shadow-2xl text-center text-white max-w-md w-full mx-4">
        
        {/* Logo / Title */}
        <h1 className="text-5xl font-extrabold mb-6 text-green-400 animate-pulse drop-shadow-md">
          🌿 AgriConnect
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-lg tracking-wide">
          Empowering Farmers & Connecting Buyers — Grow Together 🌱
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-green-700 hover:bg-gray-100 px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
