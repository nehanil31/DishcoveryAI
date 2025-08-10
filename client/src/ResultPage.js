import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour, city } = location.state || {};

  const handleDownload = () => {
    const blob = new Blob([tour], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${city.toLowerCase()}_foodie_tour.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!tour) {
    return (
      <div className="p-10 text-center text-white bg-black min-h-screen">
        <h2 className="text-2xl mb-4">No data found!</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300"
        >
          ⬅ Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🍽️ Your Foodie Tour in {city}</h1>
      <div className="bg-gray-900 p-6 rounded leading-relaxed space-y-4">
        {tour.split("\n").map((line, index) => {
          const lower = line.toLowerCase();
          let emoji = "";
          if (lower.includes("breakfast")) emoji = "🍳 ";
          else if (lower.includes("lunch")) emoji = "🥗 ";
          else if (lower.includes("dinner")) emoji = "🍝 ";
          else if (lower.includes("restaurant")) emoji = "📍 ";
          else if (lower.includes("indoor")) emoji = "🏠 ";
          else if (lower.includes("outdoor")) emoji = "🌳 ";
          else if (lower.includes("dishes")) emoji = "🍽️ ";
          else if (lower.includes("experience")) emoji = "📝 ";

          return <p key={index}>{emoji + line.trim()}</p>;
        })}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleDownload}
          className="bg-green-400 text-black py-2 px-4 rounded hover:bg-green-300"
        >
          📥 Download Tour as Text
        </button>

        <button
          onClick={() => navigate("/")}
          className="bg-yellow-400 text-black py-2 px-4 rounded hover:bg-yellow-300"
        >
          🔁 Start Over
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
