import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const defaultAvatar = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    setLoading(true);
    try {
      // 1. Check for session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const user = session.user;

      // 2. Fetch profile, favorites, and listings
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);

      const { data: favData } = await supabase.from("favorites").select(`listings (*)`).eq("user_id", user.id);
      if (favData) setFavorites(favData.map(f => f.listings).filter(l => l !== null));

      const { data: myData } = await supabase.from("listings").select("*").eq("user_id", user.id);
      if (myData) setMyListings(myData);

    } catch (error) {
      console.error("Error loading profile:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadAvatar(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("Avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("Avatars").getPublicUrl(filePath);

      await supabase.from("profiles").update({ profilepic_url: publicUrl }).eq("id", user.id);
      setProfile({ ...profile, profilepic_url: publicUrl });
      alert("Profile picture updated!");
    } catch (error) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteListing(listingId) {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (!error) setMyListings(myListings.filter(l => l.id !== listingId));
  }

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Loading profile...</div>;

  // UPDATED REDIRECT FOR LOGGED OUT USERS
  if (!profile) {
    return (
      <div style={{ padding: "100px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2 style={{ marginBottom: "10px" }}>Access Denied</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>You must be logged in to view your profile.</p>
        <button 
          onClick={() => navigate("/login")} 
          style={addBtnStyle}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      
      {/* PERSONAL DETAILS */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "20px" }}>Personal Details</h2>
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto" }}>
              <img src={profile.profilepic_url || defaultAvatar} style={avatarStyle} alt="Profile" />
              {uploading && <div style={uploadOverlayStyle}>...</div>}
            </div>
            <div style={{ marginTop: "15px" }}>
              <label style={uploadBtnStyle}>
                {uploading ? "Uploading..." : "Change Photo"}
                <input type="file" accept="image/*" onChange={handleUploadAvatar} disabled={uploading} style={{ display: "none" }} />
              </label>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={detailItem}><label style={labelStyle}>NAME</label><div style={infoBox}>{profile.firstname} {profile.lastname}</div></div>
            <div style={detailItem}><label style={labelStyle}>UNIVERSITY</label><div style={infoBox}>{profile.university}</div></div>
            <div style={detailItem}><label style={labelStyle}>EMAIL</label><div style={infoBox}>{profile.email}</div></div>
          </div>
        </div>
      </section>

      {/* MY POSTINGS */}
      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>My Postings ({myListings.length})</h3>
          <button onClick={() => navigate("/create")} style={addBtnStyle}>+ Create New Listing</button>
        </div>
        {myListings.length > 0 ? (
          <div style={gridStyle}>
            {myListings.map(listing => (
              <div key={listing.id} style={cardStyle}>
                <img src={listing.image_urls?.[0]} style={cardImgStyle} alt="posting" onClick={() => navigate(`/listing/${listing.id}`)} />
                <div style={{ padding: "12px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{listing.title}</h4>
                  <p style={{ color: "#0984e3", fontWeight: "bold", margin: 0 }}>${listing.rent}/mo</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button onClick={() => navigate(`/listing/${listing.id}`)} style={editBtnStyle}>View Live</button>
                    <button onClick={() => handleDeleteListing(listing.id)} style={deleteBtnStyle}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <p style={{ color: "#888" }}>You haven't posted any listings yet.</p>}
      </section>

      {/* FAVORITES */}
      <section style={sectionStyle}>
        <h3 style={{ marginBottom: "20px" }}>My Favorites ({favorites.length})</h3>
        {favorites.length > 0 ? (
          <div style={gridStyle}>
            {favorites.map(listing => (
              <div key={listing.id} style={cardStyle}>
                <img src={listing.image_urls?.[0]} style={cardImgStyle} alt="favorite" onClick={() => navigate(`/listing/${listing.id}`)} />
                <div style={{ padding: "12px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{listing.title}</h4>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#666" }}>{listing.city}, {listing.state}</p>
                  <button onClick={() => navigate(`/listing/${listing.id}`)} style={viewBtnStyle}>View Listing</button>
                </div>
              </div>
            ))}
          </div>
        ) : <p style={{ color: "#888" }}>No saved favorites yet.</p>}
      </section>

      {/* LOGOUT */}
      <section style={logoutSectionStyle}>
        <h3 style={{ color: "#c53030", marginTop: 0 }}>Account Actions</h3>
        <button onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }} style={logoutBtnStyle}>Log Out</button>
      </section>
    </div>
  );
}

// --- STYLES ---
const sectionStyle = { marginBottom: "50px", paddingBottom: "30px", borderBottom: "1px solid #eee" };
const detailItem = { marginBottom: "15px" };
const labelStyle = { fontSize: "11px", fontWeight: "bold", color: "#666", marginBottom: "5px", display: "block" };
const infoBox = { padding: "10px", background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "4px" };
const avatarStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #0984e3" };
const uploadBtnStyle = { background: "#0984e3", color: "white", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" };
const uploadOverlayStyle = { position: "absolute", top: 0, left: 0, width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "flex", justifyContent: "center", alignItems: "center" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" };
const cardStyle = { background: "white", border: "1px solid #eee", borderRadius: "10px", overflow: "hidden" };
const cardImgStyle = { width: "100%", height: "130px", objectFit: "cover", cursor: "pointer" };
const addBtnStyle = { padding: "10px 20px", background: "#0984e3", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" };
const editBtnStyle = { flex: 1, padding: "6px", background: "#f1f1f1", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" };
const deleteBtnStyle = { flex: 1, padding: "6px", background: "#fee2e2", color: "#dc3545", border: "none", borderRadius: "4px", cursor: "pointer" };
const viewBtnStyle = { width: "100%", padding: "8px", background: "#0984e3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
const logoutSectionStyle = { marginTop: "40px", padding: "20px", background: "#fff5f5", borderRadius: "8px", border: "1px solid #feb2b2" };
const logoutBtnStyle = { padding: "10px 25px", background: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };