import { Link } from "react-router-dom";
import { useState } from "react";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import buildingImage from "../assets/building.jpg";

export default function SplashPage() {
  const [activeTab, setActiveTab] = useState("buy");
  const [location, setLocation] = useState("Yogyakarta");

  return (
    <div className="splash-outer">
      <div className="splash-inner">
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
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
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
