import pandas as pd
import random

# ✅ Define symptoms, diseases, and medicines
medicine_data = {
    "headache": ("Migraine", "Paracetamol", ["Feverfew", "Butterbur", "Magnesium"]),
    "fever": ("Viral Infection", "Ibuprofen", ["Giloy", "Tulsi Tea", "Elderberry"]),
    "cough": ("Common Cold", "Dextromethorphan", ["Honey & Ginger", "Mulethi", "Thyme Tea"]),
    "fatigue": ("Chronic Fatigue Syndrome", "Vitamin B12", ["Ashwagandha", "Ginseng", "Rhodiola"]),
    "nausea": ("Gastroenteritis", "Ondansetron", ["Ginger", "Peppermint Oil", "Lemon Balm"]),
    "joint pain": ("Arthritis", "Ibuprofen", ["Turmeric", "Boswellia", "Devil’s Claw"]),
    "skin rash": ("Allergic Reaction", "Antihistamine", ["Aloe Vera", "Calendula", "Oatmeal"]),
    "dizziness": ("Vertigo", "Meclizine", ["Ginseng", "Bacopa", "Ginger"]),
    "shortness of breath": ("Asthma", "Albuterol", ["Deep Breathing", "Quercetin", "Yoga"]),
    "sore throat": ("Strep Throat", "Throat Lozenges", ["Licorice Root Tea", "Slippery Elm", "Saltwater Gargle"]),
    "stomach pain": ("Gastritis", "Omeprazole", ["Fennel Seeds", "Chamomile", "Probiotics"]),
    "muscle pain": ("Fibromyalgia", "Diclofenac", ["Eucalyptus Oil", "Arnica", "Massage Therapy"]),
    "anxiety": ("Generalized Anxiety Disorder", "Alprazolam", ["Chamomile", "Valerian Root", "L-Theanine"]),
    "insomnia": ("Sleep Disorder", "Melatonin", ["Lavender Oil", "Passionflower", "Magnesium"])
}

# ✅ Define health factors and age groups
health_factors_list = ["diabetes", "hypertension", "obesity", "asthma", "allergies", "heart disease", "no known condition"]
age_groups = ["child", "adult", "senior"]
severity_levels = ["mild", "moderate", "severe"]
user_preferences = ["herbal", "pharmaceutical", "no preference"]

# ✅ Generate dataset
data = []
for _ in range(15000):
    symptom = random.choice(list(medicine_data.keys()))
    disease, conventional_medicine, alternative_meds = medicine_data[symptom]
    health_factor = random.choice(health_factors_list)
    age_group = random.choice(age_groups)
    severity = random.choice(severity_levels)
    preference = random.choice(user_preferences)
    alternative_medicine = random.sample(alternative_meds, 2)  # Pick 2 random alternative medicines
    conv_med_rating = round(random.uniform(3.5, 5.0), 1)  # More realistic ratings (3.5 - 5.0)
    alt_med_rating = round(random.uniform(3.0, 5.0), 1)  # More realistic ratings (3.0 - 5.0)

    data.append([
        symptom, disease, health_factor, age_group, severity, preference,
        conventional_medicine, ", ".join(alternative_medicine),
        conv_med_rating, alt_med_rating
    ])

# ✅ Create DataFrame
df = pd.DataFrame(data, columns=[
    "symptom", "predictedDisease", "healthFactor", "ageGroup", "severity", "userPreference",
    "conventionalMedicine", "alternativeMedicine",
    "conventionalMedicineRating", "alternativeMedicineRating"
])

# ✅ Save dataset to CSV
df.to_csv("synthetic_medicine_dataset.csv", index=False)

print("✅ Enhanced dataset generated successfully as 'synthetic_medicine_dataset.csv'!")