import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from .preprocess import preprocess_input

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Define base and model paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "cleaned_synthetic_medicine_dataset_v2.csv")

# Updated to use correct encoder path
MODEL_PATH = os.path.join(MODEL_DIR, "boosted_disease_prediction_model.pkl")
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, "boosted_feature_names.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "boosted_ordinal_encoder.pkl")

print("✅ Starting Prediction Service with Boosted Model...")
print(f"📦 Model path: {MODEL_PATH}")
print(f"📄 Feature names path: {FEATURE_NAMES_PATH}")
print(f"🎛️ Encoder path: {ENCODER_PATH}")

# Load model
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Boosted model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load model: {str(e)}")

# Load feature names
try:
    feature_names = pd.read_pickle(FEATURE_NAMES_PATH)
    print(f"✅ Feature names loaded. Total features: {len(feature_names)}")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load feature names: {str(e)}")

# Load encoder
try:
    encoder = joblib.load(ENCODER_PATH)
    print("✅ Encoder loaded successfully.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load encoder: {str(e)}")

# Define input schema
class InputData(BaseModel):
    symptoms: str  # comma-separated e.g., "fever, cough"
    healthFactors: str = ""  # optional comma-separated e.g., "diabetes, smoker"
    ageGroup: str  # e.g., "adult"
    severity: str  # e.g., "moderate"

@app.post("/predict")
def predict_disease(data: InputData):
    """
    Accepts user input, preprocesses it, and returns the predicted disease.
    """
    try:
        # Preprocess using feature names
        input_df = preprocess_input(data.dict(), feature_names)

        # Manually transform encoded features if needed
        categorical_cols = ["ageGroup", "severity"]
        input_df[categorical_cols] = encoder.transform(input_df[categorical_cols])

        # Predict
        prediction = model.predict(input_df)[0]
        probs = model.predict_proba(input_df)[0]
        classes = model.classes_
        confidence = max(probs)

        return {
            "predicted_disease": prediction,
            "confidence": round(confidence, 4),
            "top_classes": sorted(
                zip(classes, probs),
                key=lambda x: x[1],
                reverse=True
            )[:3]  # top 3 predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
