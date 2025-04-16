import pandas as pd
import re

def normalize(text):
    """Clean and normalize user input."""
    return re.sub(r"[^\w\s]", "", text).strip().lower().replace(" ", "_")

def get_closest_match(name, feature_names):
    """Find the best approximate match (simple partial match) from feature names."""
    for feat in feature_names:
        if name in feat:
            return feat
    return None

def preprocess_input(data, feature_names):
    """
    Converts user input into a feature vector aligned with the boosted model.
    Symptoms and healthFactors are one-hot encoded,
    while ageGroup and severity are kept raw for ordinal encoding.
    """
    # Initialize input features with zero for all one-hot encoded symptom/healthFactor columns
    input_features = {feature: 0 for feature in feature_names if feature not in ["ageGroup", "severity"]}

    # Process symptoms
    if data.get("symptoms"):
        symptoms = [normalize(s) for s in data["symptoms"].split(",")]
        for sym in symptoms:
            col = f"symptom_{sym}"
            if col in input_features:
                input_features[col] = 1
            else:
                alt_col = get_closest_match(col, feature_names)
                if alt_col:
                    input_features[alt_col] = 1
                else:
                    print(f"⚠️ Unrecognized symptom: {sym}")

    # Process health factors
    if data.get("healthFactors"):
        factors = [normalize(f) for f in data["healthFactors"].split(",")]
        for factor in factors:
            col = f"healthfactor_{factor}"
            if col in input_features:
                input_features[col] = 1
            else:
                alt_col = get_closest_match(col, feature_names)
                if alt_col:
                    input_features[alt_col] = 1
                else:
                    print(f"⚠️ Unrecognized health factor: {factor}")

    # Append raw categorical values for encoder
    input_features["ageGroup"] = normalize(data.get("ageGroup", ""))
    input_features["severity"] = normalize(data.get("severity", ""))

    return pd.DataFrame([input_features])
