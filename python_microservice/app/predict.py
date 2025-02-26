import joblib
import pandas as pd
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI()

# Load environment variables
load_dotenv()

# Resolve file paths based on your directory structure
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "cleaned_synthetic_medicine_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "python_microservice", "models", "disease_prediction_model.pkl")

print("✅ Starting Prediction Service...")
print(f"📂 Dataset Path: {DATASET_PATH}")
print(f"📂 Model Path: {MODEL_PATH}")

# Check if model file exists
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"❌ Model file not found at {MODEL_PATH}. Please check the path.")

# Load the trained model
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully!")
    if hasattr(model, "feature_names_in_"):
        EXPECTED_FEATURES = list(model.feature_names_in_)
        print("🔍 Model's expected feature names:", EXPECTED_FEATURES)
    else:
        raise ValueError("Model does not have the attribute 'feature_names_in_'.")
except Exception as e:
    raise RuntimeError(f"Model loading failed: {e}")

# Define input schema for FastAPI
class InputData(BaseModel):
    symptom: str
    healthFactor: str
    ageGroup: str
    severity: str
    userPreference: str

# Function to one-hot encode input data; accepts either a dict or a Pydantic model
def encode_input(data):
    """
    Converts API input (dict or InputData) into a one-hot encoded DataFrame that matches the trained model's expected feature set.
    """
    # If data is a Pydantic model, convert it to a dictionary
    if hasattr(data, "dict"):
        data = data.dict()
    
    # Initialize a dictionary with all expected features set to 0
    feature_dict = {feature: 0 for feature in EXPECTED_FEATURES}
    
    # Create keys from input data (using lower case to match the training encoding)
    symptom_key = f"symptom_{data['symptom'].lower()}"
    health_key = f"healthfactor_{data['healthFactor'].lower()}"
    age_key = f"agegroup_{data['ageGroup'].lower()}"
    severity_key = f"severity_{data['severity'].lower()}"
    preference_key = f"userpreference_{data['userPreference'].lower()}"
    
    # Activate the corresponding feature if it exists in the expected feature set
    for key in [symptom_key, health_key, age_key, severity_key, preference_key]:
        if key in feature_dict:
            feature_dict[key] = 1
        else:
            print(f"Warning: Expected key '{key}' not found in model features.")
    
    # Convert to DataFrame and ensure column order matches EXPECTED_FEATURES exactly
    df = pd.DataFrame([feature_dict], columns=EXPECTED_FEATURES)
    
    print("🔍 Encoded Input DataFrame:\n", df)  # Debug output
    return df

# Prediction endpoint
@app.post("/predict")
def get_prediction(data: InputData):
    """
    Processes input data, applies one-hot encoding, and uses the trained model to predict the disease.
    """
    try:
        df = encode_input(data)
        prediction = model.predict(df)[0]
        return {"predicted_disease": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
