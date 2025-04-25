import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Result() {
  const location = useLocation();
  const data = location.state?.result;
  const summaryLink = location.state?.summaryLink;  // The link to the generated PDF
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data) {
      setError('No data to display.');
    }
  }, [data]);

  // Function to trigger download
  const handleDownload = () => {
    setLoading(true);
    try {
      const link = document.createElement('a');
      link.href = summaryLink;
      link.download = 'sustainability_report.pdf'; // Download the PDF
      link.click();
    } catch (e) {
      setError('Error downloading the report.');
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return <div className="text-center text-gray-500">No data to display.</div>;
  }

  const { solar, wind, water, green } = data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sustainability Result</h1>

      {/* Solar Energy */}
      <div className="mb-4 p-4 border shadow-lg">
        <h2 className="text-xl font-semibold">🌞 Solar</h2>
        <p><strong>Potential:</strong> {solar.value}</p>
        <p className={solar.result.includes("❌") ? "text-red-600" : "text-green-600"}>{solar.result}</p>
      </div>

      {/* Wind Energy */}
      <div className="mb-4 p-4 border shadow-lg">
        <h2 className="text-xl font-semibold">💨 Wind</h2>
        <p><strong>Status:</strong> {wind.status}</p>
        <p>{wind.message}</p>
      </div>

      {/* Water Harvesting */}
      <div className="mb-4 p-4 border shadow-lg">
        <h2 className="text-xl font-semibold">💧 Water Harvesting</h2>
        <ul className="list-disc ml-6">
          <li><strong>Rainfall Score:</strong> {water.rainfall_score}</li>
          <li><strong>Soil Score:</strong> {water.soil_score}</li>
          <li><strong>Slope Score:</strong> {water.slope_score}</li>
          <li><strong>Water Harvesting Score:</strong> {water.water_harvesting_score}</li>
        </ul>
      </div>

      {/* Green Cover */}
      <div className="mb-4 p-4 border shadow-lg">
        <h2 className="text-xl font-semibold">🌿 Green Cover</h2>
        <p><strong>Green Coverage:</strong> {green.green_coverage}%</p>
        <p><strong>Barren Coverage:</strong> {green.barren_coverage}%</p>
        <p className={green.is_feasible ? "text-green-600" : "text-red-600"}>
          {green.is_feasible ? "✅ Suitable for Afforestation" : "❌ Not Suitable"}
        </p>
      </div>

      {/* Download PDF Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Downloading..." : "Download Report (PDF)"}
        </button>
      </div>

      {/* Error message */}
      {error && <div className="text-center text-red-600 mt-4">{error}</div>}
    </div>
  );
}

export default Result;
