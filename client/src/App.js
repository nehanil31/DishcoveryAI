import React, { useState } from "react";
import axios from "axios";
import TrueFocus from './TrueFocus'; // Dynamic heading component
import './App.css'; // Animations if any

function App() {
  const [city, setCity] = useState("");
  const [diet, setDiet] = useState("");
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState(null);
  const [error, setError] = useState(null);
  const [isCityFocused, setIsCityFocused] = useState(false);

  const handleGenerate = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setTour(null);

    try {
      const res = await axios.post("http://localhost:5000/generate-tour", {
        city: city.trim(),
        dietary_preferences: diet.trim() || "none",
      });

      if (res.data.success) {
        setTour(res.data.output);
      } else {
        setError("Failed to generate tour.");
      }
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }

    setLoading(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = () => {
    const blob = new Blob([tour], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${city.trim().toLowerCase()}_foodie_tour.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6 text-white"
      style={{
        backgroundImage: "url('/bg-chef.jpg')",
      }}
    >
      <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg max-w-md w-full relative">
        {/* Heading */}
        <TrueFocus 
          sentence="DISHCOVERY!"
          manualMode={false}
          textColor="green"
          blurAmount={5}
          borderColor="yellow"
          animationDuration={2}
          pauseBetweenAnimations={1}
        />

        {/* Input Form */}
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
        </div>

        {/* Error Display */}
        {error && <p className="mt-4 text-red-400">{error}</p>}

        {/* Tour Output */}
        {tour && (
          <div className="mt-6 bg-gray-900 bg-opacity-70 p-4 rounded max-w-2xl text-left leading-relaxed text-white font-light space-y-4">
            {tour.split("\n").map((line, index) => {
              const lower = line.toLowerCase();
              let emoji = "";
              if (lower.includes("breakfast")) emoji = "🍳 ";
              else if (lower.includes("lunch")) emoji = "🥗 ";
              else if (lower.includes("dinner")) emoji = "🍝 ";
              else if (lower.includes("indoor")) emoji = "🏠 ";
              else if (lower.includes("outdoor")) emoji = "🌳 ";
              else if (lower.includes("restaurant")) emoji = "📍 ";
              else if (lower.includes("dishes")) emoji = "🍽️ ";
              else if (lower.includes("experience")) emoji = "📝 ";

              return <p key={index}>{emoji + line.trim()}</p>;
            })}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="mt-4 bg-green-400 text-black py-2 px-4 rounded hover:bg-green-300"
            >
              📥 Download Tour as Text
            </button>
          </div>
        )}

        {/* Scroll-to-top Button */}
        {tour && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 bg-white-400 hover:bg-yellow-300 text-black p-3 rounded-full shadow-lg z-50"
          >
        👆🏻
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
