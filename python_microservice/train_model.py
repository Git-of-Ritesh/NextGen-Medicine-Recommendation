import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier

# Define paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DATASET_PATH = "D:\\NEW AMRS\\alt-medicine-recommender\\datasets\\cleaned_synthetic_medicine_dataset.csv"
MODEL_DIR = os.path.join(BASE_DIR, "python_microservice", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "disease_prediction_model.pkl")

# Ensure the model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)  # ✅ Create directory if it doesn't exist

# Load dataset
df = pd.read_csv(DATASET_PATH)

# Ensure 'predicteddisease' column exists
if 'predicteddisease' not in df.columns:
    raise ValueError("❌ Error: 'predicteddisease' column is missing from dataset!")

# Selecting features (excluding the target column)
X = df.drop(columns=['predicteddisease'])  
y = df['predicteddisease']  # Target variable

# Convert categorical features into numerical values (One-Hot Encoding)
X = pd.get_dummies(X)

# Train a simple model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save the trained model
joblib.dump(model, MODEL_PATH)
print(f"✅ Model trained and saved at {MODEL_PATH}")
print("🔍 Model's expected feature names:", list(X.columns))
