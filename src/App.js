import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

const App = () => {
  // Toggle between 'recommendation' and 'alternative'
  const [mode, setMode] = useState("recommendation");

  // States for ML-based recommendations
  const [symptom, setSymptom] = useState("");
  const [healthFactor, setHealthFactor] = useState("");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [severity, setSeverity] = useState("moderate");
  const [userPreference, setUserPreference] = useState("pharmaceutical");

  // State for Alternative Medicine Search
  const [medicineName, setMedicineName] = useState("");

  // Response and error states
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // Handler for ML-based recommendation
  const handleFetchRecommendations = async () => {
    setError("");
    try {
      const requestData = {
        symptoms: symptom.trim(),
        healthFactors: healthFactor.trim(),
        ageGroup: ageGroup,
        severity: severity,
        userPreference: userPreference,
      };
      console.log("Sending ML Request:", requestData);
      // Calling Node.js backend endpoint for recommendations
      const res = await axios.post("http://localhost:5000/api/recommendations", requestData);
      console.log("ML Response:", res.data);
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching recommendations: " + (err.response?.data?.error || err.message));
    }
  };

  // Handler for alternative medicine search (OpenFDA)
  const handleFetchAlternatives = async () => {
    setError("");
    try {
      const requestData = { medicineName: medicineName.trim() };
      console.log("Sending Alternative Medicine Request:", requestData);
      const res = await axios.post("http://localhost:5000/api/alternative-medicines", requestData);
      console.log("Alternative Medicine Response:", res.data);
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching alternative medicines: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container">
      <h1 className="header">Alternative Medicine Recommender</h1>

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${mode === "recommendation" ? "active" : ""}`}
          onClick={() => {
            setMode("recommendation");
            setResponse(null);
            setError("");
          }}
        >
          Get Recommendations
        </button>
        <button
          className={`toggle-button ${mode === "alternative" ? "active" : ""}`}
          onClick={() => {
            setMode("alternative");
            setResponse(null);
            setError("");
          }}
        >
          Find Alternative Medicines
        </button>
      </div>

      {mode === "recommendation" ? (
        <div className="form-section">
          <div className="form-group">
            <label className="label">Symptoms:</label>
            <input
              type="text"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g., headache, fever"
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="label">Health Factors:</label>
            <input
              type="text"
              value={healthFactor}
              onChange={(e) => setHealthFactor(e.target.value)}
              placeholder="e.g., diabetes, allergies"
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="label">Age Group:</label>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="select">
              <option value="child">Child</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Severity:</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="select">
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">User Preference:</label>
            <select value={userPreference} onChange={(e) => setUserPreference(e.target.value)} className="select">
              <option value="pharmaceutical">Pharmaceutical</option>
              <option value="herbal">Herbal</option>
              <option value="no preference">No Preference</option>
            </select>
          </div>
          <button onClick={handleFetchRecommendations} className="button">
            Get Recommendations
          </button>
        </div>
      ) : (
        <div className="form-section">
          <div className="form-group">
            <label className="label">Enter Conventional Medicine Name:</label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g., paracetamol"
              className="input"
            />
          </div>
          <button onClick={handleFetchAlternatives} className="button">
            Find Alternatives
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {response && (
        <div className="result-container">
          {mode === "recommendation" ? (
            <>
              <h3 className="result-title">Predicted Disease:</h3>
              <p>{response.predictedDisease}</p>
              <h3 className="result-title">Alternative Medicine Recommendations:</h3>
              <div className="markdown">
                <ReactMarkdown>{response.alternativeMedicine || "No recommendations available"}</ReactMarkdown>
              </div>
            </>
          ) : (
            <>
              <h3 className="result-title">Original Medicine:</h3>
              <p>{response.medicineName}</p>
              <h3 className="result-title">Alternative Medicines:</h3>
              <ul>
                {response.alternatives && response.alternatives.map((med, index) => (
                  <li key={index}>{med}</li>
                ))} 
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
