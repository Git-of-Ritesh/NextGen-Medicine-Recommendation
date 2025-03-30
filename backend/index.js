const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],  // ✅ Allow both ports
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));


app.use(bodyParser.json());

/**
 * ✅ Streaming Recommendations Endpoint
 * - Calls ML Microservice for disease prediction
 * - Streams alternative medicine recommendations from Gemini API
 */
app.post("/api/recommendations/stream", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        // ✅ Validate input
        const { symptom, healthFactor, ageGroup, severity, userPreference } = req.body;
        if (!symptom || !healthFactor || !ageGroup || !severity || !userPreference) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // ✅ Call Python ML Microservice for Disease Prediction
        const mlResponse = await axios.post("http://localhost:8000/predict", {
            symptom,
            healthFactor,
            ageGroup,
            severity,
            userPreference
        }, { headers: { "Content-Type": "application/json" } });

        const predictedDisease = mlResponse.data.predicted_disease;
        console.log("Predicted Disease:", predictedDisease);

        // ✅ Construct the Gemini API Prompt
        const promptText = `Provide exactly 5 alternative medicines and 2 conventional medicines for treating ${predictedDisease}.

        - For **Acupuncture**, specify **the exact points on the body** where it should be performed.
        - For **Herbal Remedies**, list the **exact herb names**.
        - For **Supplements**, provide the **exact supplement names**.
        - For **Mind-Body Techniques**, specify **the exact methods or practices**.
        
        For each, include a **one-line health precaution**.
        End with a **2-line disclaimer** stating these are suggestions only and a doctor should be consulted and not to rely on this recommendations only.`;

        const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        // ✅ Call Gemini API
        const geminiResponse = await axios.post(
            geminiURL,
            { contents: [{ parts: [{ text: promptText }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        // ✅ Extract text response
        const rawText = geminiResponse.data.candidates[0].content.parts[0].text;
        const lines = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

        // ✅ Organize data into sections
        let alternativeMedicines = [];
        let conventionalMedicines = [];
        let disclaimer = [];
        let currentSection = "";

        lines.forEach((line) => {
            if (line.toLowerCase().includes("alternative medicine")) {
                currentSection = "alternative";
            } else if (line.toLowerCase().includes("conventional medicine")) {
                currentSection = "conventional";
            } else if (line.toLowerCase().includes("disclaimer")) {
                currentSection = "disclaimer";
            } else {
                // ✅ Remove unwanted numbering
                let cleanLine = line.replace(/^\d+\.\s*/, "");

                if (currentSection === "alternative") {
                    alternativeMedicines.push(cleanLine);
                } else if (currentSection === "conventional") {
                    conventionalMedicines.push(cleanLine);
                } else if (currentSection === "disclaimer") {
                    disclaimer.push(cleanLine);
                }
            }
        });

        // ✅ Stream response
        res.write(`**Alternative Medicine**\n\n`);
        alternativeMedicines.forEach((med, index) => res.write(`${index + 1}. ${med}\n`));

        res.write(`\n**Conventional Medicine**\n\n`);
        conventionalMedicines.forEach((med, index) => res.write(`${index + 1}. ${med}\n`));

        res.write(`\n**Disclaimer**\n\n`);
        disclaimer.forEach((line) => res.write(`${line}\n`));

        res.end();

    } catch (err) {
        console.error("Error in hybrid workflow:", err.message);
        res.write(`data: Error occurred: ${err.message}\n\n`);
        res.end();
    }
});
    

/**
 * ✅ Fetch Alternative Medicines using OpenFDA API
 */
app.post("/api/alternative-medicines", async (req, res) => {
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
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
