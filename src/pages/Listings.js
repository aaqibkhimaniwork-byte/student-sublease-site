import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Listings() {
  const [dbListings, setDbListings] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const [uniSearch, setUniSearch] = useState("");
  const [universities, setUniversities] = useState([]); // list of unis for autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false); // control dropdown

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    university: "", city: "", state: "", zip_code: "",
    latestMoveIn: "", earliestLeaseEnd: "",
  });

  const [preferences, setPreferences] = useState({
    maxRent: 5000, minSqft: 0, pets: false, parking: false, furnished: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 FIXED: Remove the broken fetch call completely
  // ❌ This was causing the "Failed to fetch" error
  // useEffect(() => { ... })  <-- REMOVED

  async function fetchData() {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    // Fetch listings and join with profiles to get creator name and avatar
    const { data: listingsData } = await supabase
      .from("listings")
      .select(`
        *,
        profiles (
          firstname,
          lastname,
          profilepic_url
        )
      `);

    setDbListings(listingsData || []);

    if (currentUser) {
      const { data: favData } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", currentUser.id);
      setUserFavorites(favData?.map(f => f.listing_id) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
  async function fetchListings() {
    setLoading(true);

    const query = filters.university
      ? `?university=${encodeURIComponent(filters.university)}`
      : "";

    const res = await fetch(`http://localhost:5050/api/listings${query}`);
    const data = await res.json();

    setDbListings(data);
    setLoading(false);
  }

  fetchListings();
}, [filters.university]);


  useEffect(() => {
  async function fetchUniversities() {
    try {
      const res = await fetch("http://localhost:5050/api/universities");
      const data = await res.json();
      setUniversities(data.map(u => u.name)); // store only names
    } catch (err) {
      console.error("Failed to load universities:", err);
    }
  }

  fetchUniversities();
}, []);


  // Toggle Favorite logic
  const toggleFavorite = async (e, listingId) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to favorite listings.");

    const isFavorited = userFavorites.includes(listingId);

    if (isFavorited) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      if (!error) setUserFavorites(userFavorites.filter(id => id !== listingId));
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: user.id, listing_id: listingId }]);
      if (!error) setUserFavorites([...userFavorites, listingId]);
    }
  };

  // Processing: Filter and Sort
  const processedListings = dbListings
    .filter((listing) => {
      const matchUni = !filters.university || listing.universities.some(u => u.toLowerCase().includes(filters.university.toLowerCase()));
      const matchCity = !filters.city || listing.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchState = !filters.state || listing.state.toLowerCase().includes(filters.state.toLowerCase());
      const matchZip = !filters.zip_code || listing.zip_code.includes(filters.zip_code);
      const matchMoveIn = !filters.latestMoveIn || new Date(listing.lease_start) <= new Date(filters.latestMoveIn);
      const matchLeaseEnd = !filters.earliestLeaseEnd || new Date(listing.lease_end) >= new Date(filters.earliestLeaseEnd);

      const matchRent = listing.rent <= preferences.maxRent;
      const matchSqft = listing.sq_ft >= preferences.minSqft;

      return matchUni && matchCity && matchState && matchZip && matchMoveIn && matchLeaseEnd && matchRent && matchSqft;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const currentListings = processedListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(processedListings.length / itemsPerPage);

  if (loading) return <div style={{ padding: "20px" }}>Loading Listings...</div>;

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
    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // allow click
    style={inputStyle}
  />
  
  {showSuggestions && uniSearch && (
    <ul style={{
      position: "absolute", top: "35px", left: 0, right: 0,
      background: "#fff", border: "1px solid #ddd", maxHeight: "150px",
      overflowY: "auto", borderRadius: "4px", zIndex: 10, padding: 0, margin: 0
    }}>
      {universities
        .filter(u => u.toLowerCase().includes(uniSearch.toLowerCase()))
        .map((u, index) => (
          <li
            key={index}
            onClick={() => {
              setUniSearch(u);
              setFilters({ ...filters, university: u });
              setCurrentPage(1);
              setShowSuggestions(false);
            }}
            style={{ padding: "8px", cursor: "pointer" }}
          >
            {u}
          </li>
      ))}
    </ul>
  )}
</div>
<button
  onClick={() => {
    setFilters({ ...filters, university: uniSearch }); // trigger backend fetch
    setCurrentPage(1);
  }}
  style={{ marginTop: "5px" }}
>
  Search
</button>
          <input placeholder="City" onChange={(e) => {setFilters({...filters, city: e.target.value}); setCurrentPage(1);}} style={inputStyle} />
        </div>
        <div style={filterColumnStyle}>
          <h4>Budget</h4>
          <label style={labelStyle}>Max Rent: ${preferences.maxRent}</label>
          <input type="range" min="400" max="5000" step="50" value={preferences.maxRent} 
                 onChange={(e) => setPreferences({...preferences, maxRent: Number(e.target.value)})} style={{width: "100%"}} />
        </div>
        <div style={filterColumnStyle}>
          <h4>Amenities</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <label><input type="checkbox" onChange={(e) => setPreferences({...preferences, pets: e.target.checked})} /> Pets</label>
            <label><input type="checkbox" onChange={(e) => setPreferences({...preferences, parking: e.target.checked})} /> Parking</label>
            <label><input type="checkbox" onChange={(e) => setPreferences({...preferences, furnished: e.target.checked})} /> Furnished</label>
          </div>
        </div>
      </div>

      {/* LISTINGS RESULTS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {currentListings.map(listing => {
          const isExpanded = expandedId === listing.id;
          const isFav = userFavorites.includes(listing.id);
          const creator = listing.profiles;

          return (
            <div 
              key={listing.id} 
              style={isExpanded ? expandedCardStyle : compactCardStyle} 
              onClick={() => setExpandedId(isExpanded ? null : listing.id)}
            >
              
              {/* IMAGE PREVIEW */}
              <div style={isExpanded ? expandedImgContainer : compactImgContainer}>
                <img src={listing.image_urls?.[0] || 'https://via.placeholder.com/400x300'} alt="Listing" style={imgStyle} />
                <button onClick={(e) => toggleFavorite(e, listing.id)} style={heartButtonStyle}>
                  {isFav ? "❤️" : "🤍"}
                </button>
              </div>

              {/* CONTENT */}
              <div style={{ padding: "20px", flex: 1, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0 }}>{listing.title}</h3>
                  <h3 style={{ margin: 0, color: "#0984e3" }}>${listing.rent}/mo</h3>
                </div>
                <p style={{ color: "#666", margin: "10px 0" }}>{listing.city}, {listing.state} • {listing.sq_ft} sqft</p>
                
                {/* Expand Hint */}
                {!isExpanded && (
                  <div style={expandHintStyle}>
                    <span style={{ fontSize: "0.8rem", color: "#0984e3", fontWeight: "bold" }}>
                      Click to view details ▾
                    </span>
                  </div>
                )}

                {isExpanded && (
                  <div style={detailsAreaStyle}>
                    
                    {/* Amenity Pills */}
                    <div style={amenityGridStyle}>
                      <div style={amenityItemStyle}>
                        <span>{listing.pets_allowed ? "✅" : "❌"} Pets</span>
                      </div>
                      <div style={amenityItemStyle}>
                        <span>{listing.parking_available ? "✅" : "❌"} Parking</span>
                      </div>
                      <div style={amenityItemStyle}>
                        <span>{listing.furnished ? "✅" : "❌"} Furnished</span>
                      </div>
                    </div>

                    {/* Creator Profile Link */}
                    <div 
                      style={creatorBadgeStyle} 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${listing.user_id}`);
                      }}
                    >
                      <img 
                        src={creator?.profilepic_url || "https://via.placeholder.com/40"} 
                        style={creatorImgStyle} 
                        alt="Creator" 
                      />
                      <div>
                        <span style={{ fontSize: "11px", color: "#888", display: "block" }}>POSTED BY</span>
                        <span style={{ fontWeight: "bold", color: "#0984e3" }}>
                          {creator?.firstname} {creator?.lastname}
                        </span>
                      </div>
                    </div>

                    <p><strong>Available Universities:</strong> {listing.universities.join(", ")}</p>
                    <p><strong>Lease Period:</strong> {listing.lease_start} to {listing.lease_end}</p>
                    <p><strong>Address:</strong> {listing.street_address}, {listing.zip_code}</p>
                    
                    <div style={{ margin: "15px 0" }}>
                        <strong>Description:</strong>
                        <p style={{ lineHeight: "1.6", color: "#444" }}>{listing.description}</p>
                    </div>

                    {/* Gallery */}
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

const heartButtonStyle = { position: "absolute", top: "10px", right: "10px", background: "white", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" };

const expandHintStyle = { position: "absolute", bottom: "15px", right: "20px", pointerEvents: "none" };
const detailsAreaStyle = { marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" };

const amenityGridStyle = { display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", padding: "12px", background: "#f8f9fa", borderRadius: "8px" };
const amenityItemStyle = { fontSize: "0.85rem", fontWeight: "bold", color: "#444", display: "flex", alignItems: "center", gap: "5px" };

const creatorBadgeStyle = { display: "flex", alignItems: "center", gap: "12px", background: "#f0f7ff", padding: "10px 15px", borderRadius: "8px", marginBottom: "20px", width: "fit-content" };
const creatorImgStyle = { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #0984e3" };

const paginationStyle = { marginTop: "30px", textAlign: "center", display: "flex", justifyContent: "center", gap: "15px", alignItems: "center" };
