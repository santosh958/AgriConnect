import React from 'react';

function Sidebar({ onSelect }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div style={{
      width: '200px',
      height: '100vh',
      background: '#222',
      color: '#fff',
      padding: '20px'
    }}>
      <h3>Farmer Panel</h3>
      <button onClick={() => onSelect('add')}>➕ Add Crop</button><br />
      <button onClick={() => onSelect('list')}>📋 My Crops</button><br />
      <button onClick={() => onSelect('orders')}>📬 Orders</button><br />
      <button onClick={handleLogout}>🔓 Logout</button>
    </div>
  );
}

export default Sidebar;
