from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

# Load the trained model
with open('crop_model.pkl', 'rb') as f:
    model = pickle.load(f)

app = Flask(__name__)
CORS(app)

@app.route('/predict-crop', methods=['POST'])
def predict_crop():
    data = request.json
    try:
        # Extract values from JSON request
        N = float(data['N'])
        P = float(data['P'])
        K = float(data['K'])
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])

        # Format input for prediction
        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        prediction = model.predict(features)

        # Send prediction result
        return jsonify({'recommended_crop': prediction[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # Run on port 5100 to avoid conflict with Node.js
    app.run(debug=True, port=5100)
