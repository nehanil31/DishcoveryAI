import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TrueFocus from './TrueFocus';

function HomePage() {
  const [city, setCity] = useState("");
  const [diet, setDiet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCityFocused, setIsCityFocused] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/generate-tour", {
        city: city.trim(),
        dietary_preferences: diet.trim() || "none",
      });

      if (res.data.success) {
        // navigate with state
        navigate("/result", {
          state: {
            city,
            tour: res.data.output,
          },
        });
      } else {
        setError("Failed to generate tour.");
      }
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6 text-white"
      style={{
        backgroundImage: "url('/bg-chef.jpg')",
      }}
    >
      <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg max-w-md w-full relative">
        <TrueFocus
          sentence="DISHCOVERY!"
          manualMode={false}
          textColor="green"
          blurAmount={5}
          borderColor="yellow"
          animationDuration={2}
          pauseBetweenAnimations={1}
        />

        <div className="flex flex-col items-center space-y-5">
          <div className={`transition-all duration-300 ${isCityFocused ? "w-80" : "w-32"} flex justify-center`}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Type any City you wish"
              className="p-3 text-black rounded bg-white bg-opacity-80 w-full"
              onFocus={() => setIsCityFocused(true)}
              onBlur={() => {
                if (!city) setIsCityFocused(false);
              }}
            />
          </div>

          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="w-full p-3 text-black rounded bg-white bg-opacity-80"
          >
            <option value="">Select dietary preference</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="none">None</option>
          </select>

          <button
            onClick={handleGenerate}
            className="w-full bg-yellow-400 text-black py-3 rounded font-semibold hover:bg-yellow-300"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Foodie Tour"}
          </button>

          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
