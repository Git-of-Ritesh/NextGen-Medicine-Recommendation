import joblib
import os


MODEL_PATH = r"D:\NEW AMRS\alt-medicine-recommender\python_microservice/models/disease_prediction_model.pkl"
# Load trained model
model = joblib.load(MODEL_PATH)

# Print expected feature names
if hasattr(model, "feature_names_in_"):
    print("✅ Model's expected feature names:", list(model.feature_names_in_))
else:
    print("⚠️ Model does not have feature_names_in_.")
