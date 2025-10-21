import React, { useState } from 'react';
import axios from 'axios';
import './AddCropForm.css'; // ✅ Separate CSS for styling

function AddCropForm() {
  const [form, setForm] = useState({
    category: '',
    crop_name: '',
    quantity_kg: '',
    price_per_kg: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const farmer_id = localStorage.getItem('farmer_id');
    if (!farmer_id) {
      alert("Farmer ID missing. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("farmer_id", farmer_id);
    formData.append("category", form.category);
    formData.append("crop_name", form.crop_name);
    formData.append("quantity_kg", form.quantity_kg);
    formData.append("price_per_kg", form.price_per_kg);
    formData.append("description", form.description);
    if (photo) formData.append("photo", photo);

    try {
      await axios.post('http://localhost:5000/add-crop', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert('✅ Crop Added Successfully!');
      setForm({ category: '', crop_name: '', quantity_kg: '', price_per_kg: '', description: '' });
      setPhoto(null);
    } catch (err) {
      console.error("❌ Error adding crop:", err);
      alert('Failed to add crop ❌');
    }
  };

  return (
    <div className="add-crop-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} className="add-crop-form">

        <label>Product Category</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select a category</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Grains">Grains</option>
          <option value="Pulses">Pulses</option>
        </select>

        <label>Product Name</label>
        <input name="crop_name" placeholder="Enter product name" value={form.crop_name} onChange={handleChange} required />

        <label>Price per Kg</label>
        <input name="price_per_kg" type="number" placeholder="Enter price per kg" value={form.price_per_kg} onChange={handleChange} required />

        <label>Available Quantity (kg)</label>
        <input name="quantity_kg" type="number" placeholder="Enter available quantity" value={form.quantity_kg} onChange={handleChange} required />

        <label>Upload Photo</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} required />

        <label>Product Description</label>
        <textarea name="description" placeholder="Enter product description" value={form.description} onChange={handleChange} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddCropForm;

