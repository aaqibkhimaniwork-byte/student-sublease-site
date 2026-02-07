import { useState } from "react";

export default function Listings({ listings }) {
  const [preferences, setPreferences] = useState({
    pets: true,
    minSqft: 350,
    maxRent: 900,
    parking: true,
  });

  const [weights, setWeights] = useState({
    pets: 3,
    sqft: 1,
    rent: 2,
    parking: 1,
  });

  // Compute score dynamically
  const filteredListings = listings
    .map((listing) => {
      let score = 0;

      // Loop through weights
      Object.keys(weights).forEach((key) => {
        if (key === "sqft" && listing.sqft >= preferences.minSqft) score += weights[key];
        else if (key === "rent" && listing.rent <= preferences.maxRent) score += weights[key];
        else if (preferences[key] && listing[key]) score += weights[key];
      });

      return { ...listing, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Listings</h2>

      <div style={{ marginBottom: "20px" }}>
        <h4>Filter Preferences</h4>
        {Object.keys(preferences).map((key) => {
          if (typeof preferences[key] === "boolean") {
            return (
              <div key={key}>
                <label>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                  />
                </label>
              </div>
            );
          } else {
            return (
              <div key={key}>
                <label>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                  <input
                    type="number"
                    value={preferences[key]}
                    onChange={(e) => setPreferences({ ...preferences, [key]: Number(e.target.value) })}
                  />
                </label>
              </div>
            );
          }
        })}
      </div>

      {/* Listings */}
      {filteredListings.map((listing) => (
        <div key={listing.id} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
          <h3>{listing.title}</h3>
          {Object.keys(listing).map((key) => {
            if (key !== "id" && key !== "title" && key !== "score") {
              return (
                <p key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {typeof listing[key] === "boolean" ? (listing[key] ? "Yes" : "No") : listing[key]}
                </p>
              );
            }
          })}
          <p>Score: {listing.score}</p>
        </div>
      ))}
    </div>
  );
}
