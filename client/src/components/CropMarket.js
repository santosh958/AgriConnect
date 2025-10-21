import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../components/CartContext';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function CropMarket() {
  const [crops, setCrops] = useState([]);
  const [quantity, setQuantity] = useState({});
  const [reviewRating, setReviewRating] = useState({});
  const [reviewText, setReviewText] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await axios.get('http://localhost:5000/all-crops');
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
    } catch (err) {
      console.error("❌ Error fetching crops:", err);
    }
  };

  const handleQuantityChange = (cropId, value) => {
    setQuantity({ ...quantity, [cropId]: value });
  };

  const handleAddToCart = (crop) => {
    const qty = Number(quantity[crop.id]);
    if (!qty || qty <= 0) return alert("Please enter a valid quantity.");
    if (qty > crop.quantity_kg) return alert("Quantity exceeds available stock.");
    addToCart({ ...crop, quantity: qty });
    alert("🛒 Item added to cart!");
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<FaStar key={i} color="#FFD700" />);
      else if (i - rating <= 0.5) stars.push(<FaStarHalfAlt key={i} color="#FFD700" />);
      else stars.push(<FaRegStar key={i} color="#FFD700" />);
    }
    return stars;
  };

  // Clickable star rating component
  const StarSelector = ({ cropId }) => {
    const rating = reviewRating[cropId] || 0;
    return (
      <div className="flex space-x-1 mb-2">
        {[1,2,3,4,5].map((star) => (
          <FaStar
            key={star}
            size={24}
            className="cursor-pointer"
            color={star <= rating ? "#FFD700" : "#C0C0C0"}
            onClick={() => setReviewRating({ ...reviewRating, [cropId]: star })}
          />
        ))}
      </div>
    );
  };

  const handleAddReview = async (crop) => {
    const stars = Number(reviewRating[crop.id]);
    const description = reviewText[crop.id] || "";

    if (!stars || stars < 1 || stars > 5) return alert("Select a rating between 1 and 5");

    try {
      await axios.post("http://localhost:5000/add-review", {
        crop_id: crop.id,
        stars,
        description
      });
      alert("Review added!");
      setReviewRating({ ...reviewRating, [crop.id]: 5 });
      setReviewText({ ...reviewText, [crop.id]: "" });
      fetchCrops(); // refresh to update avgRating
    } catch (err) {
      console.error("❌ Add review error:", err);
      alert("Failed to add review");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Available Crops</h2>
      {crops.length === 0 ? (
        <p>No crops available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {crops.map(crop => (
            <div key={crop.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
              <img
                src={`http://localhost:5000/uploads/${crop.photo}`}
                alt={crop.crop_name}
                className="h-40 w-full object-cover rounded mb-3"
              />
              <h3 className="text-lg font-semibold">{crop.crop_name}</h3>
              <p className="text-sm text-gray-600">{crop.farmer_name || "Unknown"} - {crop.location || "N/A"}</p>
              <p className="mt-1 font-bold text-green-700">₹{crop.price_per_kg}/kg</p>
              <p className="text-sm text-gray-500 mt-1">{crop.quantity_kg} kg available</p>

              <div className="flex items-center mt-2">
                {renderStars(crop.avgRating || 0)}
                <span className="text-sm text-gray-600 ml-2">({crop.reviews_count || 0} reviews)</span>
              </div>

              <input
                type="number"
                placeholder="Qty in kg"
                value={quantity[crop.id] || ''}
                onChange={(e) => handleQuantityChange(crop.id, e.target.value)}
                className="border px-2 py-1 mt-3 rounded w-full"
              />
              <button
                onClick={() => handleAddToCart(crop)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 mt-3 rounded w-full font-semibold transition"
              >
                🛒 Add to Cart
              </button>

              {/* Review Section */}
              <div className="mt-3 border-t pt-3">
                <textarea
                  placeholder="Write your review..."
                  value={reviewText[crop.id] || ""}
                  onChange={(e) => setReviewText({ ...reviewText, [crop.id]: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                />
                <StarSelector cropId={crop.id} />
                <button
                  onClick={() => handleAddReview(crop)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded w-full font-semibold transition"
                >
                  Submit Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CropMarket;

