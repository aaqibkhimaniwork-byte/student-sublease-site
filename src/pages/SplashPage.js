import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import buildingImage from "../assets/building.jpg";
import { supabase } from "../supabaseClient";

export default function SplashPage() {
  const [activeTab, setActiveTab] = useState("buy");
  const [location, setLocation] = useState("");

  // Auth & Profile
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchUserAndProfile() {
      setLoadingProfile(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("firstname, lastname, profilepic_url")
          .eq("id", currentUser.id) // adjust if your column is user_id
          .single();

        if (!error && profileData) setProfile(profileData);
      }

      setLoadingProfile(false);
    }

    fetchUserAndProfile();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="splash-outer">
      <div className="splash-inner">
        {/* HEADER */}
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
              {loadingProfile ? (
                <div style={{ padding: "5px 10px" }}>Loading...</div>
              ) : !user ? (
                <Link to="/login" className="contact-button">
                  Log In / Sign Up
                </Link>
              ) : (
                // My Profile Link with white name
                <Link to="/myprofile" className="profile-button">
                  <img
                    src={profile?.profilepic_url || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <span
                    className="profile-name"
                    style={{ color: "white" }} // <-- Name color is white
                  >
                    {profile?.firstname
                      ? `${profile.firstname} ${profile?.lastname || ""}`
                      : user.email}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* MAIN HERO SECTION */}
        <main className="splash-main">
          <div className="hero-section">
            <div className="hero-content">
              <h2 className="hero-title">
                Your <span className="highlight">Next Place</span> Starts Here. 
                Discover Convenient Verified Subleases.
              </h2>
              <p className="hero-subtitle">A platform for students to find verified subleases in their desired locations.</p>

              <div className="search-container">
                <div className="search-tabs">
                  <button 
                    className={`tab ${activeTab === "sell" ? "active" : ""}`}
                    onClick={() => setActiveTab("sell")}
                  >
                    Find Your University Sublease
                  </button>
                </div>

                <div className="search-form">
                  <div className="search-input-group">
                    <label>Enter University</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., University of Georgia"
                    />
                  </div>
                  <button className="search-button">Search</button>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="building-image-container">
                <img 
                  src={buildingImage} 
                  alt="Apartment Building" 
                  className="building-image"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
