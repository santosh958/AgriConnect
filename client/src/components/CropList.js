import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "./CropList.css";

function CropList() {
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [updatedQty, setUpdatedQty] = useState("");
  const [showReviewsFor, setShowReviewsFor] = useState(null); // crop id to show reviews

  useEffect(() => {
    const fetchCrops = async () => {
      const farmer_id = localStorage.getItem("farmer_id");
      const res = await axios.get(
        `http://localhost:5000/my-crops?farmer_id=${farmer_id}`
      );
      // Fetch reviews for each crop
      const cropsWithReviews = await Promise.all(
        res.data.map(async (crop) => {
          try {
            const reviewsRes = await axios.get(`http://localhost:5000/crop-reviews/${crop.id}`);
            return {
              ...crop,
              reviews: reviewsRes.data.reviews,
              avgRating: reviewsRes.data.avgStars,
              reviews_count: reviewsRes.data.reviews_count
            };
          } catch {
            return { ...crop, reviews: [], avgRating: 0, reviews_count: 0 };
          }
        })
      );
      setCrops(cropsWithReviews);
    };
    fetchCrops();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this crop?")) {
      await axios.delete(`http://localhost:5000/delete-crop/${id}`);
      setCrops(crops.filter((c) => c.id !== id));
    }
  };

  const handleEditClick = (crop) => {
    setEditingCrop(crop);
    setUpdatedPrice(crop.price_per_kg);
    setUpdatedQty(crop.quantity_kg);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/update-crop/${editingCrop.id}`, {
        price_per_kg: updatedPrice,
        quantity_kg: updatedQty,
      });

      setCrops(
        crops.map((c) =>
          c.id === editingCrop.id
            ? { ...c, price_per_kg: updatedPrice, quantity_kg: updatedQty }
            : c
        )
      );

      setEditingCrop(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<FaStar key={i} color="#FFD700" />);
      else if (i - rating <= 0.5) stars.push(<FaStar key={i} color="#FFD700" />);
      else stars.push(<FaStar key={i} color="#ccc" />);
    }
    return stars;
  };

  return (
    <div className="my-products-container">
      <h2>My Products</h2>
      {crops.length === 0 ? (
        <p>No crops listed yet.</p>
      ) : (
        <div className="product-grid">
          {crops.map((crop) => (
            <div key={crop.id} className="product-card">
              <img
                src={`http://localhost:5000/uploads/${crop.photo}`}
                alt={crop.crop_name}
                className="product-photo"
              />
              <div className="product-info">
                <h3>{crop.crop_name}</h3>
                <span className="category-badge">{crop.category}</span>
                <p className="price-qty">
                  ₹{crop.price_per_kg}/kg | {crop.quantity_kg} kg available
                </p>

                <div style={{ display: "flex", gap: "10px", margin: "5px 0" }}>
                  <div style={{ display: "flex", lineHeight: "1em" }}>
                    {renderStars(crop.avgRating || 0)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#777", alignSelf: "center" }}>
                    ({crop.reviews_count || 0} reviews)
                  </div>
                </div>

                {/* EDIT FORM */}
                {editingCrop && editingCrop.id === crop.id && (
                  <div style={{ margin: "10px 0", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
                    <h4>Edit {crop.crop_name}</h4>
                    <input
                      type="number"
                      value={updatedPrice}
                      onChange={(e) => setUpdatedPrice(e.target.value)}
                      placeholder="Price per kg"
                      style={{ marginRight: "10px" }}
                    />
                    <input
                      type="number"
                      value={updatedQty}
                      onChange={(e) => setUpdatedQty(e.target.value)}
                      placeholder="Quantity kg"
                      style={{ marginRight: "10px" }}
                    />
                    <button onClick={handleUpdate} style={{ marginRight: "5px", padding: "5px 10px" }}>
                      Save
                    </button>
                    <button onClick={() => setEditingCrop(null)} style={{ padding: "5px 10px" }}>
                      Cancel
                    </button>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="action-row">
                  <button
                    className="view-btn"
                    onClick={() => setShowReviewsFor(showReviewsFor === crop.id ? null : crop.id)}
                  >
                    <FaEye /> {showReviewsFor === crop.id ? "Hide Reviews" : "View Reviews"}
                  </button>
                  <button className="edit-btn" onClick={() => handleEditClick(crop)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(crop.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>

                {/* REVIEWS SECTION */}
                {showReviewsFor === crop.id && (
                  <div style={{ marginTop: "10px", borderTop: "1px solid #ccc", paddingTop: "10px", maxHeight: "200px", overflowY: "auto" }}>
                    {crop.reviews.length === 0 ? (
                      <p>No reviews yet.</p>
                    ) : (
                      crop.reviews.map((review, index) => (
                        <div key={index} style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {renderStars(review.stars)}
                            <span style={{ fontSize: "12px", color: "#777" }}>{review.stars} Star{review.stars>1?'s':''}</span>
                          </div>
                          <p style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                            {review.description || "No comment"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CropList;
