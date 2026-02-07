import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const defaultAvatar = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";

  useEffect(() => {
    async function fetchPublicData() {
      setLoading(true);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileData) setProfile(profileData);

      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", id);

      setListings(listingsData || []);
      setLoading(false);
    }

    fetchPublicData();
  }, [id]);

  if (loading) return <div style={containerStyle}>Loading profile details...</div>;
  if (!profile) return <div style={containerStyle}>User not found.</div>;

  return (
    <div style={containerStyle}>
      {/* USER DETAILS SECTION */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "25px" }}>User Details</h2>
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          <div style={{ textAlign: "center" }}>
            <img 
              src={profile.profilepic_url || defaultAvatar} 
              style={avatarStyle} 
              alt="Profile" 
            />
          </div>

          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={detailItem}>
              <label style={labelStyle}>NAME</label>
              <div style={infoBox}>{profile.firstname} {profile.lastname}</div>
            </div>
            
            <div style={detailItem}>
              <label style={labelStyle}>UNIVERSITY</label>
              <div style={infoBox}>{profile.university}</div>
            </div>

            <div style={detailItem}>
              <label style={labelStyle}>CONTACT EMAIL</label>
              <div style={infoBox}>{profile.email}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE LISTINGS SECTION */}
      <section>
        <h3 style={{ marginBottom: "20px" }}>Active Postings ({listings.length})</h3>
        {listings.length > 0 ? (
          <div style={gridStyle}>
            {listings.map((listing) => (
              <div 
                key={listing.id} 
                style={listingCardStyle} 
                /* REDIRECT FIXED HERE */
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <img 
                  src={listing.image_urls?.[0] || "https://via.placeholder.com/300x200"} 
                  style={listingImgStyle} 
                  alt={listing.title} 
                />
                <div style={{ padding: "15px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{listing.title}</h4>
                  <p style={{ color: "#0984e3", fontWeight: "bold", margin: 0 }}>${listing.rent}/mo</p>
                  <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>{listing.city}, {listing.state}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888" }}>This user hasn't posted any listings yet.</p>
        )}
      </section>

      <button onClick={() => navigate(-1)} style={backButtonStyle}>
        ← Back
      </button>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" };
const sectionStyle = { marginBottom: "50px", paddingBottom: "30px", borderBottom: "1px solid #eee" };
const detailItem = { marginBottom: "15px" };
const labelStyle = { fontSize: "11px", fontWeight: "bold", color: "#666", marginBottom: "5px", display: "block", letterSpacing: "0.5px" };
const infoBox = { padding: "12px", background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "6px", color: "#333" };
const avatarStyle = { width: "140px", height: "140px", borderRadius: "50%", objectFit: "cover", border: "3px solid #0984e3" };

const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "25px" };
const listingCardStyle = { 
  background: "white", 
  border: "1px solid #eee", 
  borderRadius: "10px", 
  overflow: "hidden", 
  cursor: "pointer", 
  transition: "transform 0.2s, box-shadow 0.2s" 
};
const listingImgStyle = { width: "100%", height: "150px", objectFit: "cover" };
const backButtonStyle = { marginTop: "40px", padding: "10px 20px", background: "#eee", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };