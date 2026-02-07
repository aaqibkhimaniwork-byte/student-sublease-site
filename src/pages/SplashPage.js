import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/SplashPage.css";
import buildingImage from "../assets/building.jpg";

export default function SplashPage() {
  const [activeTab, setActiveTab] = useState("buy");
  const [location, setLocation] = useState("Yogyakarta");
  const [propertyType, setPropertyType] = useState("32 × 10m²");
  const [priceRange, setPriceRange] = useState("$10,000 - $25,000");

  return (
    <div className="splash-outer">
      <div className="splash-inner">
        <header className="splash-header">
          <div className="header-content">
            <div className="title-wrap">
              <h1 className="app-title">Easy Sublease</h1>
            </div>

            <nav className="main-nav" aria-label="primary">
              <ul>
                <li><Link to="/">Townhomes</Link></li>
                <li><Link to="/">Apartments</Link></li>
                <li><Link to="/">Single Homes</Link></li>
                <li><Link to="/">Condos</Link></li>
                <li><Link to="/">Studios</Link></li>
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
                    className={`tab ${activeTab === "buy" ? "active" : ""}`}
                    onClick={() => setActiveTab("buy")}
                  >
                    Buy
                  </button>
                  <button 
                    className={`tab ${activeTab === "rent" ? "active" : ""}`}
                    onClick={() => setActiveTab("rent")}
                  >
                    Rent
                  </button>
                  <button 
                    className={`tab ${activeTab === "sell" ? "active" : ""}`}
                    onClick={() => setActiveTab("sell")}
                  >
                    Sell
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
                  <div className="search-input-group">
                    <label>Type</label>
                    <input 
                      type="text" 
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      placeholder="Property type"
                    />
                  </div>
                  <div className="search-input-group">
                    <label>Average Price</label>
                    <input 
                      type="text" 
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      placeholder="Price range"
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
