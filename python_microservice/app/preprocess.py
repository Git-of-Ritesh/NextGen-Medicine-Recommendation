import pandas as pd
import numpy as np

def preprocess_input(data, feature_names):
    """
    Converts user input into a structured DataFrame with the expected feature format.
    """
    # Define the feature dictionary with all features initialized to 0
    input_features = {feature: 0 for feature in feature_names}
    
    # Map categorical features to one-hot encoding
    symptom_col = f"symptom_{data['symptom']}"
    healthfactor_col = f"healthfactor_{data['healthFactor']}"
    agegroup_col = f"agegroup_{data['ageGroup']}"
    severity_col = f"severity_{data['severity']}"
    userpreference_col = f"userpreference_{data['userPreference']}"

    # Set the respective fields to 1 if they exist in the feature names
    for col in [symptom_col, healthfactor_col, agegroup_col, severity_col, userpreference_col]:
        if col in input_features:
            input_features[col] = 1

    # Convert to DataFrame
    input_df = pd.DataFrame([input_features])

    return input_df
