import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Listings() {
  const [dbListings, setDbListings] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [uniSearch, setUniSearch] = useState("");
  const [selectedUni, setSelectedUni] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [preferences, setPreferences] = useState({
    pets: false,
    parking: false,
    furnished: false,
    maxRent: 5000,
    minSqft: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Fetch universities
  useEffect(() => {
    async function fetchUnis() {
      try {
        const res = await fetch("http://localhost:5000/api/universities");
        const data = await res.json();
        setUniversities(data || []);
      } catch (err) {
        console.error("Failed to fetch universities:", err);
      }
    }
    fetchUnis();
  }, []);

  // Fetch listings
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("http://localhost:5000/api/listings");
        const data = await res.json();
        setDbListings(data || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      }
    }
    fetchListings();
  }, []);

  // Compute score for sorting
  const scoredListings = dbListings.map((l) => {
    let score = 0;
    if (selectedUni && l.universities?.includes(selectedUni.name)) score++;
    if (preferences.pets && l.pets_allowed) score++;
    if (preferences.parking && l.parking_available) score++;
    if (preferences.furnished && l.furnished) score++;
    if (preferences.maxRent && l.rent <= preferences.maxRent) score++;
    if (preferences.minSqft && l.sq_ft >= preferences.minSqft) score++;

    return { ...l, score };
  });

  const sortedListings = scoredListings.sort((a, b) => b.score - a.score);

  const currentListings = sortedListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* FILTER PANEL */}
      <div style={filterPanelStyle}>
        <div style={filterColumnStyle}>
          <h4>Search Area</h4>
          <div style={{ position: "relative" }}>
            <input
              placeholder="University"
              value={uniSearch}
              onChange={(e) => {
                setUniSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{ ...inputStyle, transition: "border-color 0.3s" }}
            />

            {showSuggestions && uniSearch && (
              <ul style={dropdownStyle}>
                {universities
                  .filter(u => u.name.toLowerCase().includes(uniSearch.toLowerCase()))
                  .map((u) => (
                    <li
                      key={u.id}
                      onClick={() => {
                        setSelectedUni(u);
                        setUniSearch(u.name);
                        setShowSuggestions(false);
                      }}
                      style={dropdownItemStyle}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {u.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => setSelectedUni(universities.find(u => u.name === uniSearch))}
            style={{ marginTop: "5px" }}
          >
            Filter by University
          </button>
        </div>

        <div style={filterColumnStyle}>
          <h4>Amenities & Preferences</h4>
          <label style={labelStyle}>
            <input type="checkbox" checked={preferences.pets} onChange={(e) => setPreferences({...preferences, pets: e.target.checked})} /> Pets Allowed
          </label>
          <label style={labelStyle}>
            <input type="checkbox" checked={preferences.parking} onChange={(e) => setPreferences({...preferences, parking: e.target.checked})} /> Parking Available
          </label>
          <label style={labelStyle}>
            <input type="checkbox" checked={preferences.furnished} onChange={(e) => setPreferences({...preferences, furnished: e.target.checked})} /> Furnished
          </label>
          <label style={labelStyle}>Max Rent: ${preferences.maxRent}</label>
          <input type="range" min="400" max="5000" step="50" value={preferences.maxRent} onChange={(e) => setPreferences({...preferences, maxRent: Number(e.target.value)})} style={{width: "100%"}} />
          <label style={labelStyle}>Min Sqft: {preferences.minSqft}</label>
          <input type="number" min="0" value={preferences.minSqft} onChange={(e) => setPreferences({...preferences, minSqft: Number(e.target.value)})} style={{width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd"}} />
        </div>
      </div>

      {/* LISTINGS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {currentListings.length === 0 && <p>No listings found.</p>}
        {currentListings.map(listing => {
          const isExpanded = expandedId === listing.id;

          return (
            <div
              key={listing.id}
              style={isExpanded ? expandedCardStyle : compactCardStyle}
              onClick={() => setExpandedId(isExpanded ? null : listing.id)}
            >
              <div style={isExpanded ? expandedImgContainer : compactImgContainer}>
                <img src={listing.image_urls?.[0] || 'https://via.placeholder.com/400x300'} alt="Listing" style={imgStyle} />
              </div>

              <div style={{ padding: "20px", flex: 1, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0 }}>{listing.title}</h3>
                  <h3 style={{ margin: 0, color: "#0984e3" }}>${listing.rent}/mo</h3>
                </div>
                <p style={{ color: "#666", margin: "10px 0" }}>{listing.city}, {listing.state} • {listing.sq_ft} sqft</p>

                {!isExpanded && (
                  <div style={expandHintStyle}>
                    <span style={{ fontSize: "0.8rem", color: "#0984e3", fontWeight: "bold" }}>Click to view details ▾</span>
                  </div>
                )}

                {isExpanded && (
                  <div style={detailsAreaStyle}>
                    <div style={amenityGridStyle}>
                      <div style={amenityItemStyle}>{listing.pets_allowed ? "✅" : "❌"} Pets</div>
                      <div style={amenityItemStyle}>{listing.parking_available ? "✅" : "❌"} Parking</div>
                      <div style={amenityItemStyle}>{listing.furnished ? "✅" : "❌"} Furnished</div>
                    </div>

                    <p><strong>Available Universities:</strong> {listing.universities.join(", ")}</p>
                    <p><strong>Score:</strong> {listing.score}</p>

                    <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px" }}>
                      {listing.image_urls?.map((url, i) => (
                        <img key={i} src={url} style={{ height: "100px", borderRadius: "8px", border: "1px solid #eee" }} alt="gallery" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div style={paginationStyle}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button>
        <span style={{ fontSize: "0.9rem" }}>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</button>
      </div>
    </div>
  );
}

// --- STYLES ---
const filterPanelStyle = { display: "flex", gap: "20px", background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "30px", flexWrap: "wrap" };
const filterColumnStyle = { flex: 1, minWidth: "200px" };
const inputStyle = { padding: "8px", width: "100%", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" };
const labelStyle = { fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "5px" };

const compactCardStyle = { display: "flex", background: "#fff", borderRadius: "12px", overflow: "hidden", cursor: "pointer", border: "1px solid #eee", transition: "transform 0.2s" };
const expandedCardStyle = { display: "flex", flexDirection: "column", background: "#fff", borderRadius: "12px", overflow: "hidden", cursor: "pointer", border: "1px solid #0984e3", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" };

const compactImgContainer = { width: "200px", height: "150px", flexShrink: 0, position: "relative" };
const expandedImgContainer = { width: "100%", height: "350px", position: "relative" };
const imgStyle = { width: "100%", height: "100%", objectFit: "cover" };

const expandHintStyle = { position: "absolute", bottom: "15px", right: "20px", pointerEvents: "none" };
const detailsAreaStyle = { marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" };

const amenityGridStyle = { display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", padding: "12px", background: "#f8f9fa", borderRadius: "8px" };
const amenityItemStyle = { fontSize: "0.85rem", fontWeight: "bold", color: "#444", display: "flex", alignItems: "center", gap: "5px" };

const paginationStyle = { marginTop: "30px", textAlign: "center", display: "flex", justifyContent: "center", gap: "15px", alignItems: "center" };

// --- DROPDOWN STYLES ---
const dropdownStyle = {
  position: "absolute",
  top: "35px",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #ddd",
  maxHeight: "150px",
  overflowY: "auto",
  borderRadius: "6px",
  zIndex: 10,
  padding: 0,
  margin: 0,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease-in-out",
};
const dropdownItemStyle = {
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "background 0.2s",
};