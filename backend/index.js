const express = require('express'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/recommendations', async (req, res) => {
    const { symptoms, healthFactors, ageGroup, severity, userPreference } = req.body;

    // ✅ Check if all required fields are provided
    if (!symptoms || !healthFactors || !ageGroup || !severity || !userPreference) {
        return res.status(400).json({ error: "All fields are required: symptoms, healthFactors, ageGroup, severity, userPreference" });
    }

    const mlPayload = {
        symptom: symptoms.trim(),
        healthFactor: healthFactors.trim(),
        ageGroup: ageGroup.trim(), // ✅ Now included
        severity: severity.trim(),
        userPreference: userPreference.trim()
    };

    try {
        // ✅ Step 1: Call Python Microservice for ML-Based Prediction
        const mlResponse = await axios.post("http://localhost:8000/predict", mlPayload);
        const predictedDisease = mlResponse.data.predicted_disease;
        console.log("Predicted Disease:", predictedDisease);

        // ✅ Step 2: Call Gemini API for Alternative Medicine Recommendations
        const promptText = `Provide exactly 5 alternative medicines and 2 conventional medicines for treating ${predictedDisease}.  \n\n- For **Acupuncture**, specify **the exact points on the body** where it should be performed.  \n- For **Herbal Remedies**, list the **exact herb names**.  \n- For **Supplements**, provide the **exact supplement names**.  \n- For **Mind-Body Techniques**, specify **the exact methods or practices**.  \n\nFor each, include a **one-line health precaution**.  \nEnd with a **2-line disclaimer** stating these are suggestions only and a doctor should be consulted.`;
        
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: promptText }] }],
            },
            { headers: { "Content-Type": "application/json" } }
        );

        const recommendations = geminiResponse.data;

        // ✅ Combine outputs from the ML model and Gemini API
        res.json({
            predictedDisease: predictedDisease,
            alternativeMedicine: recommendations?.candidates?.[0]?.content?.parts?.[0]?.text || "No alternative medicine found",
        });
    } catch (err) {
        console.error("Error in hybrid workflow:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: "Hybrid workflow error", details: err.message });
    }
});

// ✅ New Feature: Fetch Alternative Medicines using OpenFDA API
app.post('/api/alternative-medicines', async (req, res) => {
    const { medicineName } = req.body;

    if (!medicineName) {
        return res.status(400).json({ error: "Medicine name is required." });
    }

    try {
        // OpenFDA API Call to Find Alternative Medicines
        const fdaResponse = await axios.get(
            `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${medicineName}&limit=3&api_key=${process.env.OPENFDA_API_KEY}`
        );
        const results = fdaResponse.data.results;

        // Extract Alternative Medicine Names
        const alternativeMedicines = [...new Set(results.map((item) => item.openfda.brand_name?.[0] || "Unknown Alternative"))];

        res.json({
            medicineName,
            alternatives: alternativeMedicines
        });
    } catch (err) {
        // Check if the error is a 404 from OpenFDA meaning no results found
        if (err.response && err.response.status === 404) {
            return res.status(200).json({
                medicineName,
                alternatives: ["No alternative medicines found for this query."]
            });
        }
        console.error("Error fetching alternative medicines:", err.message);
        res.status(500).json({ error: "Failed to fetch alternative medicines", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
