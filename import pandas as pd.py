import pandas as pd

# Load the dataset with low_memory=False to prevent DtypeWarning
file_path = r"D:\NEW AMRS\alt-medicine-recommender\datasets\cleaned_synthetic_medicine_dataset.csv"
df = pd.read_csv(file_path, low_memory=False)

# Convert all columns to string type first, then back to their original types to standardize them
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')  # Convert to numeric where possible

# Fill missing values (NaN) with a placeholder or median value
df.fillna(df.median(numeric_only=True), inplace=True)

# Check if there are still missing values
print(df.isnull().sum())


#uvicorn app.main:app --reload --host 127.0.0.1 --port 8000