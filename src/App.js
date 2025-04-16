import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Papa from "papaparse";
import Dataset from "./dataset/cleaned_synthetic_medicine_dataset_v2.csv"
import ProfileImage from '../src/pictures/ProfileImage.png'
import "./App.css";

const App = () => {
  const navigate = useNavigate();

  // Toggle between 'recommendation' and 'alternative'
  const [mode, setMode] = useState("recommendation");

  // States for ML-based recommendations
  const [healthFactorsList, setHealthFactorsList] = useState([]);
  const [selectedHealthFactor, setSelectedHealthFactor] = useState("");
  const [symptomsList, setSymptomsList] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [ageGroup, setAgeGroup] = useState("Child");
  const [severity, setSeverity] = useState("moderate");
  const [userPreference, setUserPreference] = useState("pharmaceutical");

  //search for health factor in select column
  const hfDropdownRef = useRef(null);
  const ageGroupRef = useRef(null);
  const severityRef = useRef(null);
  const userPreferenceRef = useRef(null);
  const symptomRef = useRef(null);
  const [searchHealthFactor, setSearchHealthFactor] = useState("");
  const [healthFactorSelect, setHealthFactorSelect] = useState(false);
  const [ageGroupSelect, setAgeGroupSelect] = useState(false);
  const [severitySelect, setSeveritySelect] = useState(false);
  const [userPreferenceSelect, setUserPreferenceSelect] = useState(false);
  const [searchSymptom, setSearchSymptom] = useState("");
  const [symptomSelect, setSymptomSelect] = useState(false);

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

  //handle health factors in select column
  useEffect(() => {
    fetch(Dataset)
      .then(response => response.text())
      .then(csvtext => {
        const parsed = Papa.parse(csvtext, { header: true });

        const allFactors = parsed.data.flatMap(row => row.HealthFactors ? row.HealthFactors.split(',').map(s => s.trim()) : []);

        const uniqueFactors = [...new Set(allFactors)].filter(Boolean);

        setHealthFactorsList(uniqueFactors);
      })
  }, []);

  useEffect(() => {
    fetch(Dataset)
      .then(response => response.text())
      .then(csvtext => {
        const parsed = Papa.parse(csvtext, { header: true });

        const allSymptoms = parsed.data.flatMap(row => row.Symptoms ? row.Symptoms.split(',').map(s => s.trim()) : []);

        const uniqueSymptoms = [...new Set(allSymptoms)].filter(Boolean);
        setSymptomsList(uniqueSymptoms);
      })
  }, []);

  //handle the dropdown of health factors
  useEffect(() => {
    const handleHfdropdown = (event) => {
      if (hfDropdownRef.current && !hfDropdownRef.current.contains(event.target)) {
        setHealthFactorSelect(false);
      }
    };

    document.addEventListener('mousedown', handleHfdropdown);

    return () => {
      // unbind the event listener on clean up
      document.removeEventListener('mousedown', handleHfdropdown);
    };
  }, []);

  //handle the dropdown of symptoms
  useEffect(() => {
    const handleSymptomDropdown = (event) => {
      if (symptomRef.current && !symptomRef.current.contains(event.target)) {
        setSymptomSelect(false);
      }
    };

    document.addEventListener('mousedown', handleSymptomDropdown);

    return () => {
      document.removeEventListener('mousedown', handleSymptomDropdown);
    };
  }, []);

  //filter health factors based on search
  const lastTypedHf = searchHealthFactor.split(",").pop().trim();
  const filteredHealthfactors = healthFactorsList.filter(hf => 
    hf.toLowerCase().includes(lastTypedHf.toLowerCase())
  );

  //filter symptoms based on search
  const lastTypedWord = searchSymptom.split(",").pop().trim();

  const filteredSymptoms = symptomsList.filter(s =>
    s.toLowerCase().includes(lastTypedWord.toLowerCase())
  );


  //handle the age group dropdown
  useEffect(() => {
    const handleAgeGroupDropdown = (event) => {
      if (ageGroupRef.current && !ageGroupRef.current.contains(event.target)) {
        setAgeGroupSelect(false);
      }
    };

    document.addEventListener('mousedown', handleAgeGroupDropdown);

    return () => {
      //unbind the event listener on clean up
      document.removeEventListener('mosusedown', handleAgeGroupDropdown);
    }
  })

  //handle the severity dropdown
  useEffect(() => {
    const handleSeverityDropdown = (event) => {
      if (severityRef.current && !severityRef.current.contains(event.target)) {
        setSeveritySelect(false);
      }
    };

    document.addEventListener('mousedown', handleSeverityDropdown);

    return () => {
      document.removeEventListener('mousedown', handleSeverityDropdown);
    }
  })

  //handle the user preference dropdown
  useEffect(() => {
    const handleUserPreferenceDropdown = (event) => {
      if (userPreferenceRef.current && !userPreferenceRef.current.contains(event.target)) {
        setUserPreferenceSelect(false);
      }
    };

    document.addEventListener('mousedown', handleUserPreferenceDropdown);

    return () => {
      document.removeEventListener('mousedown', handleUserPreferenceDropdown);
    }
  })

  // Handler for ML-based recommendation (Streaming)
  const handleFetchRecommendations = async () => {
    setResponse("");
    setError("");
    setIsStreaming(true);

    try {
      const res = await fetch("http://localhost:5001/api/recommendations/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: searchSymptom,
          healthFactors: searchHealthFactor,
          ageGroup,
          severity,
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

      const res = await fetch("http://localhost:5001/api/alternative-medicines", {
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

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="container">
      <div className="profile-container" ref={dropdownRef}>
        <div
          className="profile-icon"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <img className="profile-image" src={ProfileImage} alt="Profile" />
        </div>
        {showProfileDropdown && (
          <div className="profile-dropdown">
            <div className="dropdown-item" onClick={() => navigate('/profile')}>
              Profile
            </div>
            <div className="dropdown-item" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
      <h1 className="header">Alternative Medicine Recommender</h1>

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <div className="active-indicator"
          style={{
            transform: `translateX(${mode === "recommendation" ? "0%" : "100%"})`,
          }}
        />
        <div className="active-buttons">
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
      </div>

      {mode === "recommendation" ? (
        <div className="form-section">
          <div className="form-group">
            <label className="label">Symptoms</label>

            <input
              type="text"
              value={searchSymptom}
              onChange={(e) => {
                setSearchSymptom(e.target.value);
                setSymptomSelect(true); // keep dropdown open when typing
              }}
              onClick={() => setSymptomSelect(true)}
              placeholder="e.g., headache, fever"
              className="input"
            />

            {symptomSelect && filteredSymptoms.length > 0 && (
              <ul className="list-group" ref={symptomRef}>
                {filteredSymptoms.map(s => (
                  <p
                    key={s}
                    value={s}
                    className="list-group-item"
                    onClick={() => {
                      let currentSymptoms = searchSymptom
                        ? searchSymptom.split(",").map(symptom => symptom.trim()).filter(Boolean)
                        : [];

                      // Avoid duplicates
                      if (!currentSymptoms.includes(s)) {
                        currentSymptoms.push(s);
                      }

                      setSearchSymptom(currentSymptoms.length > 0 ? currentSymptoms.join(", ") + ", " : "");
                      setSymptomSelect(true); // Keep dropdown open
                    }}
                  >
                    {s}
                  </p>
                ))}
              </ul>
            )}
          </div>


          <div className="form-group">
            <label className="label">Health Factors</label>
            <input
              type="text"
              value={searchHealthFactor}
              onChange={(e) => {
                setSearchHealthFactor(e.target.value);
                setHealthFactorSelect(true);
              }}
              onClick={() => setHealthFactorSelect(true)}
              placeholder="e.g., diabetes, allergies"
              className="input"
            />

            {healthFactorSelect && filteredHealthfactors.length > 0 && (
              <ul className='list-group' ref={hfDropdownRef}>
                {filteredHealthfactors.map(hf => (
                  <p
                    key={hf}
                    value={hf}
                    className="list-group-item"
                    onClick={() => {
                      let currentHealthFactor = searchHealthFactor
                        ? searchHealthFactor.split(",").map(factor => factor.trim()).filter(Boolean)
                        : [];

                      if (!currentHealthFactor.includes(hf)) {
                        currentHealthFactor.push(hf);
                      }

                      setSearchHealthFactor(currentHealthFactor.length > 0 ? currentHealthFactor.join(", ") + ", " : "");
                      setSelectedHealthFactor(currentHealthFactor.join(", "));
                      setHealthFactorSelect(true);
                    }}
                  >
                    {hf}
                  </p>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label className="label">Age Group</label>
            <div value={ageGroup}
              onClick={() => setAgeGroupSelect(true)}
              onChange={(e) => setAgeGroup(e.target.value)} className="input">{ageGroup}</div>
            {ageGroupSelect &&
              <div className="list-group2"
                ref={ageGroupRef}>
                <div
                  onClick={() => setAgeGroup("child")}
                  className="list-group-item2">child</div>
                <div
                  onClick={() => setAgeGroup("teenager")}
                  className="list-group-item2">teenager</div>
                <div
                  onClick={() => setAgeGroup("adult")}
                  className="list-group-item2">adult</div>
                <div
                  onClick={() => setAgeGroup("senior")}
                  className="list-group-item2">senior</div>
              </div>
            }
          </div>
          <div className="form-group">
            <label className="label">Severity</label>
            <div value={severity}
              onClick={() => setSeveritySelect(true)}
              className="input">{severity}</div>
            {severitySelect &&
              <div className="list-group2"
                ref={severityRef}>
                <div
                  onClick={() => setSeverity("mild")}
                  className="list-group-item2">mild</div>
                <div
                  onClick={() => setSeverity("moderate")}
                  className="list-group-item2">moderate</div>
                <div
                  onClick={() => setSeverity("severe")}
                  className="list-group-item2">severe</div>
              </div>
            }
          </div>
          <div className="form-group">
            <label className="label">User Preference</label>
            <div value={userPreference}
              onClick={() => setUserPreferenceSelect(true)}
              className="input">{userPreference}</div>
            {userPreferenceSelect &&
              <div className="list-group2"
                ref={userPreferenceRef}>
                <div
                  onClick={() => setUserPreference("pharmaceutical")}
                  className="list-group-item2">pharmaceutical</div>
                <div
                  onClick={() => setUserPreference("herbal")}
                  className="list-group-item2">herbal</div>
                <div
                  onClick={() => setUserPreference("no preference")}
                  className="list-group-item2">no preference</div>
              </div>
            }
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
      <div>  {isStreaming &&
        <h2 className="streaming-title">Intelligently suggesting remedies.</h2>}</div>
      {response && (
        <div className="result-container">
          <div className="result-title">
            <h3>Here's a personalized remedy crafted just for you ✨</h3>
          </div>
          <div className="markdown">
            <ReactMarkdown>{response || "No data yet..."}</ReactMarkdown>
            <div className="disclaimer">
              <p>This is an AI-generated suggestion. Always consult a licensed healthcare professional before making medical decisions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
