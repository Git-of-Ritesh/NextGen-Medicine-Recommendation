import pandas as pd
import os

# Updated dataset path
DATASET_PATH = os.path.join(os.path.dirname(__file__), "../../datasets/cleaned_synthetic_medicine_dataset.csv")
df = pd.read_csv(DATASET_PATH)

def get_medicine_recommendations(predicted_disease, user_preference):
    """
    Retrieves medicine recommendations based on the predicted disease and user preference.
    """
    filtered_df = df[df["predicteddisease"] == predicted_disease]

    if filtered_df.empty:
        return {"error": "No medicine recommendations found for this disease."}

    if user_preference == "pharmaceutical":
        medicines = filtered_df["conventionalmedicine"].tolist()
        ratings = filtered_df["conventionalmedicinerating"].tolist()
    else:
        medicines = filtered_df["alternativemedicine"].tolist()
        ratings = filtered_df["alternativemedicinerating"].tolist()

    recommendations = [{"medicine": med, "rating": rate} for med, rate in zip(medicines, ratings)]
    return recommendations
