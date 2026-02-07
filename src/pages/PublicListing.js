import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PublicListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchListingData();
  }, [id]);

  async function fetchListingData() {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data, error } = await supabase
        .from("listings")
        .select(`*, profiles (*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);

      if (currentUser && data) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("listing_id", id)
          .maybeSingle();
        if (favData) setIsSaved(true);
      }
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleSave = async () => {
    if (!user) return alert("Please log in to save listings.");
    if (isSaved) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase.from("favorites").insert([{ user_id: user.id, listing_id: id }]);
      if (!error) setIsSaved(true);
    }
  };

  if (loading) return <div style={msgStyle}>Loading room details...</div>;
  if (!listing) return <div style={msgStyle}>Property not found.</div>;

  return (
    <div style={containerStyle}>
      <button onClick={() => navigate(-1)} style={backBtnStyle}>← Back to Search</button>

      <div style={galleryGrid}>
        <div style={mainImgWrapper}>
          <img src={listing.image_urls?.[0]} style={fullImg} alt="Main property" />
          <button onClick={toggleSave} style={saveBtnOverlay}>
            {isSaved ? "❤️ Saved" : "🤍 Save"}
          </button>
        </div>
        <div style={sideImgWrapper}>
          {listing.image_urls?.length > 1 ? (
            <img src={listing.image_urls[1]} style={sideImg} alt="view 2" />
          ) : (
            <div style={placeholderSide}>No additional photos</div>
          )}
          <div style={placeholderSide}>
            <p style={{ margin: 0, fontSize: "14px" }}>{listing.sq_ft} sq ft</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Verified Listing</p>
          </div>
        </div>
      </div>

      <div style={contentLayout}>
        <div style={{ flex: 2 }}>
          <h1 style={titleStyle}>{listing.title}</h1>
          <p style={addressStyle}>{listing.street_address}, {listing.city}, {listing.state} {listing.zip_code}</p>
          
          <div style={tagRow}>
            <div style={tag}>{listing.furnished ? "🛋️ Furnished" : "🪑 Unfurnished"}</div>
            <div style={tag}>{listing.pets_allowed ? "🐾 Pets OK" : "🚫 No Pets"}</div>
            <div style={tag}>{listing.parking_available ? "🚗 Parking Included" : "🚲 No Parking"}</div>
          </div>

          <div style={infoSection}>
            <h3>About this sublease</h3>
            <p style={descriptionText}>{listing.description}</p>
          </div>

          <div style={infoSection}>
            <h3>Lease Details</h3>
            <p><strong>Universities:</strong> {listing.universities?.join(", ")}</p>
            <p><strong>Timeline:</strong> {listing.lease_start} to {listing.lease_end}</p>
          </div>
        </div>

        <div style={sidebar}>
          <div style={priceCard}>
            <h2 style={{ color: "#0984e3", marginBottom: "15px" }}>${listing.rent}<span style={{ fontSize: "1rem", fontWeight: "normal", color: "#666" }}>/mo</span></h2>
            <button 
              onClick={() => window.location.href = `mailto:${listing.profiles?.email}?subject=Interested in ${listing.title}`}
              style={contactBtn}
            >
              Contact {listing.profiles?.firstname}
            </button>
          </div>

          <div style={posterCard} onClick={() => navigate(`/profile/${listing.user_id}`)}>
            <p style={metaLabel}>LISTED BY</p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={listing.profiles?.profilepic_url} style={avatar} alt="poster" />
              <div>
                <p style={{ fontWeight: "bold", margin: 0 }}>{listing.profiles?.firstname} {listing.profiles?.lastname}</p>
                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>{listing.profiles?.university}</p>
              </div>
            </div>
            <p style={viewProfileHint}>View Profile →</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: "40px", maxWidth: "1100px", margin: "0 auto", fontFamily: "sans-serif" };
const msgStyle = { padding: "100px", textAlign: "center", fontSize: "1.2rem" };
const backBtnStyle = { marginBottom: "20px", padding: "10px 15px", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const galleryGrid = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", height: "450px", marginBottom: "30px" };
const mainImgWrapper = { position: "relative", height: "100%" };
const fullImg = { width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" };
const saveBtnOverlay = { position: "absolute", top: "20px", right: "20px", padding: "12px 18px", background: "white", border: "none", borderRadius: "30px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };
const sideImgWrapper = { display: "flex", flexDirection: "column", gap: "12px" };
const sideImg = { width: "100%", height: "219px", objectFit: "cover", borderRadius: "16px" };
const placeholderSide = { width: "100%", height: "219px", background: "#f0f0f0", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#888" };
const contentLayout = { display: "flex", gap: "50px", flexWrap: "wrap" };
const titleStyle = { fontSize: "2.4rem", margin: "0 0 10px 0", color: "#2d3436" };
const addressStyle = { fontSize: "1.2rem", color: "#636e72", marginBottom: "30px" };
const tagRow = { display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap" };
const tag = { padding: "8px 16px", background: "#f0f7ff", color: "#0984e3", borderRadius: "25px", fontSize: "14px", fontWeight: "600" };
const infoSection = { padding: "30px 0", borderTop: "1px solid #eee" };
const descriptionText = { lineHeight: "1.8", color: "#444", fontSize: "1.05rem" };
const sidebar = { flex: 1, minWidth: "320px" };
const priceCard = { padding: "30px", border: "1px solid #eee", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "sticky", top: "20px" };
const contactBtn = { width: "100%", padding: "16px", background: "#0984e3", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", marginTop: "10px" };
const posterCard = { marginTop: "24px", padding: "20px", background: "#f8f9fa", borderRadius: "20px", cursor: "pointer", border: "1px solid #eee" };
const metaLabel = { fontSize: "11px", fontWeight: "bold", color: "#999", letterSpacing: "1px", marginBottom: "15px" };
const avatar = { width: "55px", height: "55px", borderRadius: "50%", objectFit: "cover", border: "3px solid white" };
const viewProfileHint = { fontSize: "13px", color: "#0984e3", fontWeight: "bold", marginTop: "15px", textAlign: "right" };