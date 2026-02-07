import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import home from "../assets/House Icon.webp";
import "../styles/Home.css";

export default function Home() {
  const [session, setSession] = useState(null);
  const listings = [
    {
      id: 1,
      title: "Apartment near campus",
      rent: 850,
      distance: "0.5 miles",
    },
    {
      id: 2,
      title: "Private room in shared house",
      rent: 650,
      distance: "1.2 miles",
    },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
                <li><Link to="/">Listings</Link></li>
                <li><Link to="/">Create a Listing</Link></li>
                <li><Link to="/">Messages</Link></li>
              </ul>
            </nav>
            <div className="auth-wrap">
              {session ? (
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

        <main className="splash-main">
          <section className="home-section">
            <div className="home-content">
              <h2 className="home-title">Available Subleases</h2>
              <p className="home-subtitle">Find verified listings close to campus.</p>
            </div>
            <div className="home-list">
              {listings.map((listing) => (
                <article key={listing.id} className="home-card">
                  <h3 className="home-card-title">{listing.title}</h3>
                  <div className="home-card-meta">
                    <span>${listing.rent}/month</span>
                    <span>{listing.distance}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}