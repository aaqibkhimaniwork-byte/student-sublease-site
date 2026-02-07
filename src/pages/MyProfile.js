import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // The gray silhouette placeholder for the demo
  const defaultAvatar = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return; // Requirements check #3: stop here if no user
    }

    // 2. Read the saved profile pic URL from your SQL table
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data); // Requirements check #1: saved URL is now in state
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // Demo Protection: Check file size (1MB limit)
      if (file.size > 1024 * 1024) {
        alert("❌ File too large. Please keep demo images under 1MB.");
        setUploading(false);
        return;
      }

      // 3. Prepare file name using User ID to ensure we OVERWRITE (Requirements check #4)
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}.${fileExt}`;

      // 4. Upload directly to the 'avatars' bucket (Requirements check #5)
      const { error: uploadError } = await supabase.storage
        .from("Avatars")
        .upload(fileName, file, { 
            upsert: true // This prevents storage bloat by replacing the old file
        });

      if (uploadError) throw uploadError;

      // 5. Get the Public URL from the bucket
      const { data } = supabase.storage.from("Avatars").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // 6. Save the new URL to the 'profiles' table in SQL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profilepic_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Update local view immediately
      setProfile({ ...profile, profilepic_url: publicUrl });
      alert("✅ Profile picture updated!");

    } catch (error) {
      alert("Error uploading: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  // Styles matching your Signup/Login layout
  const containerStyle = { padding: "30px" };
  const infoBox = { 
    padding: "10px", 
    width: "300px", 
    background: "#f9f9f9", 
    border: "1px solid #ddd", 
    borderRadius: "4px", 
    marginBottom: "15px",
    color: "#333"
  };

  if (loading) return <div style={containerStyle}>Loading student profile...</div>;

  // Requirements check #3: Not logged in view
  if (!profile) {
    return (
      <div style={containerStyle}>
        <h2>Not Logged In</h2>
        <p>Please log in to view your verified student profile.</p>
        <button 
          onClick={() => navigate("/login")}
          style={{ padding: "10px", width: "324px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>My Profile</h2>

      {/* Requirements check #2: Display and Change option */}
      <div style={{ marginBottom: "25px" }}>
        <img 
          src={profile.profilepic_url || defaultAvatar} 
          alt="Avatar" 
          style={{ 
            width: "100px", 
            height: "100px", 
            borderRadius: "50%", 
            objectFit: "cover", 
            border: "2px solid #ddd",
            backgroundColor: "#eee"
          }}
        />
        <div style={{ marginTop: "10px" }}>
          <label style={{ color: "#007bff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
            {uploading ? "Uploading..." : "Change Photo"}
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              onChange={handleUpload} 
              disabled={uploading}
              style={{ display: "none" }} 
            />
          </label>
        </div>
      </div>

      <label style={{ fontSize: "11px", fontWeight: "bold", color: "#666" }}>NAME</label>
      <div style={infoBox}>{profile.firstname} {profile.lastname}</div>

      <label style={{ fontSize: "11px", fontWeight: "bold", color: "#666" }}>UNIVERSITY</label>
      <div style={infoBox}>{profile.university}</div>

      <label style={{ fontSize: "11px", fontWeight: "bold", color: "#666" }}>EMAIL</label>
      <div style={infoBox}>{profile.email}</div>

      <button 
        onClick={() => supabase.auth.signOut().then(() => navigate("/login"))}
        style={{ 
          padding: "10px", 
          width: "324px", 
          background: "#dc3545", 
          color: "white", 
          border: "none", 
          borderRadius: "4px", 
          cursor: "pointer",
          marginTop: "10px"
        }}
      >
        Log Out
      </button>
    </div>
  );
}