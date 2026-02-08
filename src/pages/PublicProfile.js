import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import "../styles/PublicProfile.css";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    }

    fetchUser();
  }, []);

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
            {user ? (
              <Link to="/myprofile" className="contact-button">
                My Profile
              </Link>
            ) : (
              <Link to="/login" className="contact-button">
                Log In/ Sign up
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  function renderShell(content) {
    return (
      <div className="splash-outer public-profile-screen">
        <div className="splash-inner">
          {renderHeader()}
          <main className="splash-main">
            <section className="public-profile-shell">
              {content}
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return renderShell(
      <div className="public-profile-status">Loading profile details...</div>
    );
  }

  if (!profile) {
    return renderShell(
      <div className="public-profile-status">User not found.</div>
    );
  }

  return renderShell(
    <div className="public-profile-page">
      {/* USER DETAILS SECTION */}
      <section className="public-profile-section">
        <h2 className="public-profile-title">User Details</h2>
        <div className="public-profile-details">
          <div className="public-profile-avatar-wrap">
            <img
              src={profile.profilepic_url || defaultAvatar}
              className="public-profile-avatar"
              alt="Profile"
            />
          </div>

          <div className="public-profile-info">
            <div className="public-profile-item">
              <label className="public-profile-label">NAME</label>
              <div className="public-profile-value">{profile.firstname} {profile.lastname}</div>
            </div>

            <div className="public-profile-item">
              <label className="public-profile-label">UNIVERSITY</label>
              <div className="public-profile-value">{profile.university}</div>
            </div>

            <div className="public-profile-item">
              <label className="public-profile-label">CONTACT EMAIL</label>
              <div className="public-profile-value">{profile.email}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE LISTINGS SECTION */}
      <section className="public-profile-section">
        <h3 className="public-profile-subtitle">Active Postings ({listings.length})</h3>
        {listings.length > 0 ? (
          <div className="public-profile-grid">
            {listings.map((listing) => (
              <div 
                key={listing.id} 
                className="public-profile-card"
                /* REDIRECT FIXED HERE */
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <img
                  src={listing.image_urls?.[0] || "https://via.placeholder.com/300x200"}
                  className="public-profile-card-image"
                  alt={listing.title}
                />
                <div className="public-profile-card-body">
                  <h4 className="public-profile-card-title">{listing.title}</h4>
                  <p className="public-profile-card-rent">${listing.rent}/mo</p>
                  <p className="public-profile-card-location">{listing.city}, {listing.state}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="public-profile-empty">This user hasn't posted any listings yet.</p>
        )}
      </section>

      <button onClick={() => navigate(-1)} className="public-profile-back">
        ← Back
      </button>
    </div>
  );
}