import React, { useState, useEffect } from "react";
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
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Cleanup function to close the streaming connection
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  // Handler for ML-based recommendation (Streaming)
  const handleFetchRecommendations = async () => {
    setResponse("");
    setError("");
    setIsStreaming(true);

    try {
        const res = await fetch("http://localhost:5000/api/recommendations/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                symptom,
                healthFactor,
                ageGroup,
                severity,
                userPreference,
            }),
        });

        if (!res.ok || !res.body) {
            throw new Error(`Server error: ${res.status}`);
        }

        // Read the response stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let finalText = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            finalText += chunk;
            setResponse((prev) => prev + chunk);
        }

        setIsStreaming(false);
    } catch (err) {
        setError("Error fetching recommendations: " + err.message);
        setIsStreaming(false);
    }
};

  
  // Handler for alternative medicine search (Regular API Call)
  const handleFetchAlternatives = async () => {
    setError("");
    setResponse("");

    try {
      const requestData = { medicineName: medicineName.trim() };

      const res = await fetch("http://localhost:5000/api/alternative-medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError("Error fetching alternative medicines: " + err.message);
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
            setResponse("");
            setError("");
          }}
        >
          Get Recommendations
        </button>
        <button
          className={`toggle-button ${mode === "alternative" ? "active" : ""}`}
          onClick={() => {
            setMode("alternative");
            setResponse("");
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
          <button onClick={handleFetchRecommendations} className="button" disabled={isStreaming}>
            {isStreaming ? "Streaming..." : "Get Recommendations"}
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
          <h3 className="result-title">Response:</h3>
          <div className="markdown">
            <ReactMarkdown>{response || "No data yet..."}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
