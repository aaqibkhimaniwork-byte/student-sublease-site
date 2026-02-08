import { useState } from "react";
import { supabase } from "../supabaseClient"; 
import { Link, useNavigate } from "react-router-dom";
import home from "../assets/House Icon.webp";
import buildingImage from "../assets/building.jpg";
import "../styles/SplashPage.css";
import "../styles/Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NEW: State for confirmation
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. EDU Email Validation
    if (!email.endsWith(".edu")) {
      setMessage("❌ Please use a valid .edu email address.");
      setLoading(false);
      return;
    }

    // 2. NEW: Password Confirmation Check
    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          firstname: firstname,
          lastname: lastname,
          university: university,
        },
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      // UPDATED: Patient confirmation message
      setMessage("✅ Success! Please check your email for a confirmation link. Please be patient, as it may take up to 1 minute to arrive.");
    }
    setLoading(false);
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
            <Link to="/login" className="contact-button">
              Log In/ Sign up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="splash-outer signup-page">
      <div className="splash-inner">
        {renderHeader()}
        <main className="splash-main">
          <div className="signup-backdrop" aria-hidden="true">
            <img src={buildingImage} alt="" />
          </div>
          <section className="signup-shell">
            <div className="signup-content">
              <h2 className="signup-title">Student Signup</h2>
              <p className="signup-subtitle">Only verified college students can join.</p>

              <form onSubmit={handleSignup} className="signup-form">
                <input
                  placeholder="First Name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                />
                <input
                  placeholder="Last Name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                />
                <input
                  placeholder="University (e.g. UGA)"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email (.edu)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="signup-primary"
                >
                  {loading ? "Registering..." : "Sign Up"}
                </button>
                <p className="signup-login">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </form>

              {message && (
                <div className={`signup-message ${message.includes("✅") ? "success" : "error"}`}>
                  {message}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}