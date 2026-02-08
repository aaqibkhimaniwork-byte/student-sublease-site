import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; 
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null); 
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Fetch session and profile
  useEffect(() => {
    async function fetchSessionAndProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("firstname, lastname, profilepic_url")
          .eq("id", session.user.id)
          .single();

        if (!error) setProfile(profileData);
      }
    }

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase
          .from("profiles")
          .select("firstname, lastname, profilepic_url")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Login successful!");
      setTimeout(() => navigate("/myprofile"), 1000);
    }
    setLoading(false);
  }

  return (
    <div className="splash-outer login-page">
      <div className="splash-inner">
        {/* HEADER */}
        <header className="splash-header">
          <div className="header-content">
            <div className="title-wrap">
              <Link to="/" className="logo-link">
                <img src={require('../assets/House Icon.webp')} alt="House Icon" className="title-icon" />
                <h1 className="app-title">Easy Lease</h1>
              </Link>
            </div>

            <nav className="main-nav" aria-label="primary">
              <ul>
                <li><Link to="/">Listings</Link></li>
                <li><Link to="/">Create a Listing</Link></li>
                <li><Link to="/">Messages</Link></li>
              </ul>
            </nav>

            <div className="auth-wrap">
              {session && profile ? (
                <Link to="/my-profile" className="profile-button">
                  <img
                    src={profile?.profilepic_url || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <span
                    className="profile-name"
                    style={{ color: "white" }} // Name is white
                  >
                    {profile?.firstname
                      ? `${profile.firstname} ${profile?.lastname || ""}`
                      : session.user.email}
                  </span>
                </Link>
              ) : (
                <Link to="/login" className="contact-button">
                  Log In / Sign Up
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* MAIN LOGIN HERO */}
        <main className="splash-main">
          <div className="hero-section">
            <div className="hero-content">
              <div className="featured-card" style={{ maxWidth: 520 }}>
                {session ? (
                  <>
                    <h2 className="card-title">You are already logged in</h2>
                    <p style={{ color: "#636e72" }}>Welcome back, <strong>{session.user.email}</strong></p>
                    <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                      <button 
                        onClick={() => navigate("/listings")}
                        className="search-button"
                        style={{ padding: "10px 20px" }}
                      >
                        Look at Listings
                      </button>
                      <button 
                        onClick={async () => { await supabase.auth.signOut(); setSession(null); }}
                        className="contact-button"
                        style={{ background: "transparent", color: "#d63031", border: "2px solid #d63031" }}
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="card-title">Student Login</h2>
                    <p style={{ color: "#636e72", marginTop: 8 }}>Log in to your account to manage subleases.</p>

                    <form onSubmit={handleLogin} style={{ marginTop: 16 }}>
                      <div className="search-input-group">
                        <label>Email</label>
                        <input
                          type="email"
                          placeholder="Email (.edu)"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="search-input-group">
                        <label>Password</label>
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="search-button"
                        style={{ width: '100%' }}
                      >
                        {loading ? "Logging in..." : "Log In"}
                      </button>
                    </form>

                    {message && (
                      <p style={{ marginTop: "12px", color: message.startsWith("Error") ? "#d63031" : "#00b894", fontWeight: 500 }}>
                        {message}
                      </p>
                    )}

                    <p style={{ marginTop: "16px", fontSize: "14px", color: "#636e72" }}>
                      Don't have an account? <Link to="/signup" style={{ color: "#4565ff", fontWeight: "600", textDecoration: "none" }}>Sign up here</Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="hero-right">
              <div className="building-image-container">
                <img src={require('../assets/building.jpg')} alt="Apartment Building" className="building-image" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
