import os
import pandas as pd
import joblib
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Define paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DATASET_PATH = os.path.join(BASE_DIR, "Alternative-Medicine-Recommendation", "datasets", "cleaned_synthetic_medicine_dataset_v2.csv")
MODEL_DIR = os.path.join(BASE_DIR, "python_microservice", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "boosted_disease_prediction_model.pkl")
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, "boosted_feature_names.pkl")

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Load dataset
df = pd.read_csv(DATASET_PATH)

# Validate target column
if "Predicted Disease" not in df.columns:
    raise ValueError("❌ 'Predicted Disease' column missing from dataset!")

# Features & target
X = df.drop(columns=["Predicted Disease"])
y = df["Predicted Disease"]

# One-hot encode categorical features
X_encoded = pd.get_dummies(X)

# Compute class weights to balance rare diseases
sample_weights = compute_sample_weight(class_weight="balanced", y=y)

# Split into train/test
X_train, X_test, y_train, y_test, sw_train, sw_test = train_test_split(
    X_encoded, y, sample_weights, test_size=0.2, random_state=42
)

# Train boosted model
model = HistGradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train, sample_weight=sw_train)

# Evaluate on test set
y_pred = model.predict(X_test)
print("📊 Classification Report:\n", classification_report(y_test, y_pred))

# Save model & features
joblib.dump(model, MODEL_PATH)
joblib.dump(list(X_encoded.columns), FEATURE_NAMES_PATH)

print(f"✅ Model saved: {MODEL_PATH}")
print(f"✅ Features saved: {FEATURE_NAMES_PATH}")
print("🔍 Example features:", list(X_encoded.columns)[:5])
