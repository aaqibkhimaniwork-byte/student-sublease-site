import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import "../styles/MyProfile.css";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // EDIT STATE
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const defaultAvatar =
    "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM4Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const user = session.user;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      const { data: favData } = await supabase
        .from("favorites")
        .select(`listings (*)`)
        .eq("user_id", user.id);

      if (favData)
        setFavorites(
          favData.map((f) => f.listings).filter((l) => l !== null)
        );

      const { data: myData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id);

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

      const { error: uploadError } = await supabase.storage
        .from("Avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("Avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({ profilepic_url: publicUrl })
        .eq("id", user.id);

      setProfile({ ...profile, profilepic_url: publicUrl });
      alert("Profile picture updated!");
    } catch (error) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteListing(listingId) {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (!error)
      setMyListings(myListings.filter((l) => l.id !== listingId));
  }

  function openEdit(listing) {
    setEditListing({
      ...listing,
      universities: listing.universities || [],
      image_urls: listing.image_urls || [],
    });
    setIsEditOpen(true);
  }

  function closeEdit() {
    setIsEditOpen(false);
    setEditListing(null);
  }

  async function handleSaveEdit() {
    if (!editListing) return;

    const { id, ...fields } = editListing;

    const formatted = {
      ...fields,
      universities:
        typeof fields.universities === "string"
          ? fields.universities
              .split(",")
              .map((u) => u.trim())
              .filter((u) => u.length > 0)
          : fields.universities,
    };

    const { error } = await supabase
      .from("listings")
      .update(formatted)
      .eq("id", id);

    if (error) {
      alert("Error updating listing: " + error.message);
      return;
    }

    setMyListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...formatted } : l))
    );

    closeEdit();
    alert("Listing updated successfully!");
  }

  async function handleImageUpload(e) {
    if (!editListing) return;
    setImageUploading(true);

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uploadedUrls = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const filePath = `listing-${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("ListingImages")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Image upload error:", uploadError.message);
          alert("Upload failed: " + uploadError.message);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("ListingImages")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length === 0) {
        setImageUploading(false);
        return;
      }

      // Update listing in DB
      const newImages = [...(editListing.image_urls || []), ...uploadedUrls];

      const { error } = await supabase
        .from("listings")
        .update({ image_urls: newImages })
        .eq("id", editListing.id);

      if (error) {
        alert("Failed to save images to listing: " + error.message);
        return;
      }

      // Update UI
      setEditListing((prev) => ({
        ...prev,
        image_urls: newImages,
      }));
    } catch (err) {
      console.error("Image upload failed:", err.message);
      alert("Image upload failed: " + err.message);
    } finally {
      setImageUploading(false);
    }
  }

  function removeImage(url) {
    if (!editListing) return;
    setEditListing((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((u) => u !== url),
    }));
  }

  function renderHeader() {
    return (
      <header className="splash-header">
        <div className="header-content">
          <div className="title-wrap">
            <Link to="/" className="logo-link">
              <img src={home} alt="House Icon" className="title-icon" />
              <h1 className="app-title">Easy Lease</h1>
            </Link>
          </div>
          <nav className="main-nav" aria-label="primary">
            <ul>
              <li><Link to="/listings">Listings</Link></li>
              <li><Link to="/create">Create a Listing</Link></li>
              <li><Link to="/messages">Messages</Link></li>
            </ul>
          </nav>
          <div className="auth-wrap">
            <Link to="/myprofile" className="contact-button">
              My Profile
            </Link>
          </div>
        </div>
      </header>
    );
  }

  function renderShell(content) {
    return (
      <div className="splash-outer profile-page">
        <div className="splash-inner">
          {renderHeader()}
          <main className="splash-main">
            <section className="profile-shell">
              <div className="profile-content">
                {content}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return renderShell(
      <div className="profile-empty">Loading profile...</div>
    );
  }

  if (!profile) {
    return renderShell(
      <div className="profile-empty">
        <h2 style={{ marginBottom: "10px" }}>Access Denied</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          You must be logged in to view your profile.
        </p>
        <button onClick={() => navigate("/login")} style={addBtnStyle}>
          Go to Login
        </button>
      </div>
    );
  }

  return renderShell(
    <>
      {/* PERSONAL DETAILS */}
      <section style={sectionStyle}>
        <h2 style={{ marginBottom: "20px" }}>Personal Details</h2>
        <div
          style={{
            display: "flex",
            gap: "40px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "140px",
                height: "140px",
                margin: "0 auto",
              }}
            >
              <img
                src={profile.profilepic_url || defaultAvatar}
                style={avatarStyle}
                alt="Profile"
              />
              {uploading && <div style={uploadOverlayStyle}>...</div>}
            </div>
            <div style={{ marginTop: "15px" }}>
              <label style={uploadBtnStyle}>
                {uploading ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={detailItem}>
              <label style={labelStyle}>NAME</label>
              <div style={infoBox}>
                {profile.firstname} {profile.lastname}
              </div>
            </div>
            <div style={detailItem}>
              <label style={labelStyle}>UNIVERSITY</label>
              <div style={infoBox}>{profile.university}</div>
            </div>
            <div style={detailItem}>
              <label style={labelStyle}>EMAIL</label>
              <div style={infoBox}>{profile.email}</div>
            </div>
          </div>
        </div>
      </section>

      {/* MY POSTINGS */}
      <section style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>My Postings ({myListings.length})</h3>
          <button onClick={() => navigate("/create")} style={addBtnStyle}>
            + Create New Listing
          </button>
        </div>

        {myListings.length > 0 ? (
          <div style={gridStyle}>
            {myListings.map((listing) => (
              <div key={listing.id} style={cardStyle}>
                <img
                  src={listing.image_urls?.[0]}
                  style={cardImgStyle}
                  alt="posting"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                />
                <div style={{ padding: "12px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{listing.title}</h4>
                  <p
                    style={{
                      color: "#0984e3",
                      fontWeight: "bold",
                      margin: 0,
                    }}
                  >
                    ${listing.rent}/mo
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      style={editBtnStyle}
                    >
                      View
                    </button>

                    <button
                      onClick={() => openEdit(listing)}
                      style={editBtnStyle}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      style={deleteBtnStyle}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888" }}>You haven't posted any listings yet.</p>
        )}
      </section>

      {/* FAVORITES */}
      <section style={sectionStyle}>
        <h3 style={{ marginBottom: "20px" }}>
          My Favorites ({favorites.length})
        </h3>
        {favorites.length > 0 ? (
          <div style={gridStyle}>
            {favorites.map((listing) => (
              <div key={listing.id} style={cardStyle}>
                <img
                  src={listing.image_urls?.[0]}
                  style={cardImgStyle}
                  alt="favorite"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                />
                <div style={{ padding: "12px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{listing.title}</h4>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "0.85rem",
                      color: "#666",
                    }}
                  >
                    {listing.city}, {listing.state}
                  </p>
                  <button
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    style={viewBtnStyle}
                  >
                    View Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888" }}>No saved favorites yet.</p>
        )}
      </section>

      {/* LOGOUT */}
      <section style={logoutSectionStyle}>
        <h3 style={{ color: "#c53030", marginTop: 0 }}>Account Actions</h3>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/login");
          }}
          style={logoutBtnStyle}
        >
          Log Out
        </button>
      </section>

      {/* EDIT LISTING MODAL */}
      {isEditOpen && editListing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2>Edit Listing</h2>

            {/* Title */}
            <label style={labelStyle}>Title</label>
            <input
              style={input}
              value={editListing.title}
              onChange={(e) =>
                setEditListing({ ...editListing, title: e.target.value })
              }
            />

            {/* Address */}
            <label style={labelStyle}>Street Address</label>
            <input
              style={input}
              value={editListing.street_address}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  street_address: e.target.value,
                })
              }
            />

            <label style={labelStyle}>City</label>
            <input
              style={input}
              value={editListing.city}
              onChange={(e) =>
                setEditListing({ ...editListing, city: e.target.value })
              }
            />

            <label style={labelStyle}>State</label>
            <input
              style={input}
              value={editListing.state}
              onChange={(e) =>
                setEditListing({ ...editListing, state: e.target.value })
              }
            />

            <label style={labelStyle}>Zip Code</label>
            <input
              style={input}
              value={editListing.zip_code}
              onChange={(e) =>
                setEditListing({ ...editListing, zip_code: e.target.value })
              }
            />

            {/* Rent / Size */}
            <label style={labelStyle}>Rent</label>
            <input
              style={input}
              type="number"
              value={editListing.rent}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  rent: parseInt(e.target.value),
                })
              }
            />

            <label style={labelStyle}>Square Footage</label>
            <input
              style={input}
              type="number"
              value={editListing.sq_ft}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  sq_ft: parseInt(e.target.value),
                })
              }
            />

            {/* Universities */}
            <label style={labelStyle}>
              Universities (comma separated)
            </label>
            <input
              style={input}
              value={
                Array.isArray(editListing.universities)
                  ? editListing.universities.join(", ")
                  : editListing.universities
              }
              onChange={(e) =>
                setEditListing({ ...editListing, universities: e.target.value })
              }
            />

            {/* Dates */}
            <label style={labelStyle}>Lease Start</label>
            <input
              style={input}
              type="date"
              value={editListing.lease_start}
              onChange={(e) =>
                setEditListing({ ...editListing, lease_start: e.target.value })
              }
            />

            <label style={labelStyle}>Lease End</label>
            <input
              style={input}
              type="date"
              value={editListing.lease_end}
              onChange={(e) =>
                setEditListing({ ...editListing, lease_end: e.target.value })
              }
            />

            {/* Booleans */}
            <label style={labelStyle}>Parking Available</label>
            <select
              style={input}
              value={editListing.parking_available ? "true" : "false"}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  parking_available: e.target.value === "true",
                })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            <label style={labelStyle}>Furnished</label>
            <select
              style={input}
              value={editListing.furnished ? "true" : "false"}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  furnished: e.target.value === "true",
                })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            <label style={labelStyle}>Pets Allowed</label>
            <select
              style={input}
              value={editListing.pets_allowed ? "true" : "false"}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  pets_allowed: e.target.value === "true",
                })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            {/* Description */}
            <label style={labelStyle}>Description</label>
            <textarea
              style={textarea}
              value={editListing.description}
              onChange={(e) =>
                setEditListing({
                  ...editListing,
                  description: e.target.value,
                })
              }
            />

            {/* Images */}
            <label style={labelStyle}>Images</label>

            <div style={imageGrid}>
              {(editListing.image_urls || []).map((url) => (
                <div key={url} style={imageItem}>
                  <img src={url} style={imageThumb} alt="listing" />
                  <button
                    onClick={() => removeImage(url)}
                    style={removeImgBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <label style={uploadBtnStyle}>
              {imageUploading ? "Uploading..." : "Add Images"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={imageUploading}
                style={{ display: "none" }}
              />
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button onClick={handleSaveEdit} style={addBtnStyle}>
                Save Changes
              </button>
              <button onClick={closeEdit} style={deleteBtnStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* --- STYLES --- */
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

/* --- Modal Styles --- */
const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "500px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflowY: "auto"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd"
};

const textarea = {
  width: "100%",
  padding: "10px",
  height: "80px",
  borderRadius: "6px",
  border: "1px solid #ddd"
};

const imageGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "10px"
};

const imageItem = {
  position: "relative",
  width: "90px",
  height: "90px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #ddd"
};

const imageThumb = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const removeImgBtn = {
  position: "absolute",
  bottom: "5px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "4px 8px",
  fontSize: "12px",
  borderRadius: "6px",
  border: "none",
  background: "#dc3545",
  color: "white",
  cursor: "pointer"
};
