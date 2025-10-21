import React, { useState } from 'react';
import axios from 'axios';

function CropPrediction() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [inputs, setInputs] = useState({ N: '', P: '', K: '', ph: '' });
  const [recommendation, setRecommendation] = useState('');
  const [rainfallDisplay, setRainfallDisplay] = useState('');

  const apiKey = 'c7d3970786634009b3041332250307'; // Replace with your API key

  const getWeather = async () => {
    if (!city.trim()) return alert("Please enter a city name");
    try {
      const res = await axios.get(
        `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=te`
      );
      setWeather(res.data);
      setRecommendation('');
      setRainfallDisplay(''); // reset rainfall view
    } catch (err) {
      alert('❌ City not found or API error.');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const getRecommendation = async () => {
    if (!weather) return alert("Please fetch weather data first");

    const rawRainfall = weather.current.precip_mm;
    const scaledRainfall = rawRainfall < 1 ? 120 : rawRainfall * 100;

    setRainfallDisplay(
      rawRainfall < 1 ? 'Fallback → 120 mm' : `${scaledRainfall.toFixed(2)} mm`
    );

    try {
      const res = await axios.post('http://localhost:5100/predict-crop', {
        N: Number(inputs.N),
        P: Number(inputs.P),
        K: Number(inputs.K),
        ph: Number(inputs.ph),
        temperature: weather.current.temp_c,
        humidity: weather.current.humidity,
        rainfall: scaledRainfall
      });
      setRecommendation(res.data.recommended_crop);
    } catch (err) {
      alert("❌ Failed to get recommendation.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">🌾 Crop Advisor</h2>

        {/* City input */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter City"
            className="flex-1 border px-4 py-2 rounded"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={getWeather} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Search
          </button>
        </div>

        {/* Weather Card */}
        {weather && (
          <div className="bg-blue-50 rounded p-4 space-y-2 text-center mb-4">
            <p className="text-lg font-semibold">{weather.location.name}, {weather.location.region}</p>
            <img src={weather.current.condition.icon} alt="weather icon" className="mx-auto" />
            <p>{weather.current.condition.text}</p>
            <p>🌡️ Temperature: {weather.current.temp_c}°C</p>
            <p>💧 Humidity: {weather.current.humidity}%</p>
            <p>🌬️ Wind: {weather.current.wind_kph} km/hr</p>
            {rainfallDisplay && <p>🌧️ Rainfall (scaled): {rainfallDisplay}</p>}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-2">
          <input type="number" name="N" placeholder="Nitrogen (N)" value={inputs.N} onChange={handleInputChange} className="w-full border p-2 rounded" />
          <input type="number" name="P" placeholder="Phosphorus (P)" value={inputs.P} onChange={handleInputChange} className="w-full border p-2 rounded" />
          <input type="number" name="K" placeholder="Potassium (K)" value={inputs.K} onChange={handleInputChange} className="w-full border p-2 rounded" />
          <input type="number" step="0.1" name="ph" placeholder="Soil pH" value={inputs.ph} onChange={handleInputChange} className="w-full border p-2 rounded" />
          <button onClick={getRecommendation} className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            📊 Get Crop Recommendation
          </button>
        </div>

        {/* Result */}
        {recommendation && (
          <div className="mt-4 text-center bg-green-100 p-3 rounded text-green-800 font-semibold">
            ✅ Suggested Crop: <span className="text-green-900">{recommendation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropPrediction;

