import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import "../styles/PublicListing.css";

export default function PublicListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchListingData();
  }, [id]);

  async function fetchListingData() {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data, error } = await supabase
        .from("listings")
        .select(`*, profiles (*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);

      if (currentUser && data) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("listing_id", id)
          .maybeSingle();
        if (favData) setIsSaved(true);
      }
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- NEW: MESSAGING INTEGRATION ---
  async function handleContactOwner() {
    if (!user) {
      alert("Please log in to message the owner.");
      navigate("/login");
      return;
    }

    if (user.id === listing.user_id) {
      alert("This is your own listing!");
      return;
    }

    // Generate the consistent conversation ID (alphabetical sort of IDs)
    const conversationId = [user.id, listing.user_id].sort().join("--");

    // Check if a message already exists in this thread
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .limit(1);

    // If no messages exist yet, send an automatic "I'm interested" message
    if (!existing || existing.length === 0) {
      await supabase.from("messages").insert([{
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: listing.user_id,
        listing_id: listing.id,
        content: `Hi ${listing.profiles?.firstname}! I'm interested in your listing: ${listing.title}.`
      }]);
    }

    // Redirect to the messaging page
    navigate("/messages");
  }

  const toggleSave = async () => {
    if (!user) return alert("Please log in to save listings.");
    if (isSaved) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase.from("favorites").insert([{ user_id: user.id, listing_id: id }]);
      if (!error) setIsSaved(true);
    }
  };

    

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
      <div className="splash-outer public-listing-screen">
        <div className="splash-inner">
          {renderHeader()}
          <main className="splash-main">
            <section className="public-listing-shell">
              {content}
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return renderShell(
      <div className="public-listing-status">Loading room details...</div>
    );
  }

  if (!listing) {
    return renderShell(
      <div className="public-listing-status">Property not found.</div>
    );
  }

  return renderShell(
    <div className="public-listing-page">
      <button onClick={() => navigate(-1)} className="public-listing-back">← Back to Search</button>

      <div className="public-listing-gallery">
        <div className="public-listing-main">
          <img src={listing.image_urls?.[0]} className="public-listing-main-image" alt="Main property" />
          <button onClick={toggleSave} className="public-listing-save">
            {isSaved ? "❤️ Saved" : "🤍 Save"}
          </button>
        </div>
        <div className="public-listing-side">
          {listing.image_urls?.length > 1 ? (
            <img src={listing.image_urls[1]} className="public-listing-side-image" alt="view 2" />
          ) : (
            <div className="public-listing-side-placeholder">No additional photos</div>
          )}
          <div className="public-listing-side-placeholder">
            <p className="public-listing-side-stat">{listing.sq_ft} sq ft</p>
            <p className="public-listing-side-sub">Verified Listing</p>
          </div>
        </div>
      </div>

      <div className="public-listing-content">
        <div className="public-listing-main-content">
          <h1 className="public-listing-title">{listing.title}</h1>
          <p className="public-listing-address">{listing.street_address}, {listing.city}, {listing.state} {listing.zip_code}</p>
          
          <div className="public-listing-tags">
            <div className="public-listing-tag">{listing.furnished ? "🛋️ Furnished" : "🪑 Unfurnished"}</div>
            <div className="public-listing-tag">{listing.pets_allowed ? "🐾 Pets OK" : "🚫 No Pets"}</div>
            <div className="public-listing-tag">{listing.parking_available ? "🚗 Parking Included" : "🚲 No Parking"}</div>
          </div>

          <div className="public-listing-section">
            <h3>About this sublease</h3>
            <p className="public-listing-description">{listing.description}</p>
          </div>

          <div className="public-listing-section">
            <h3>Lease Details</h3>
            <p><strong>Universities:</strong> {listing.universities?.join(", ")}</p>
            <p><strong>Timeline:</strong> {listing.lease_start} to {listing.lease_end}</p>
            <p><strong>Address:</strong> {listing.street_address}, {listing.city}, {listing.state} {" "}
              {listing.zip_code}</p>
          </div>
        </div>

        <div className="public-listing-sidebar">
          <div className="public-listing-price-card">
            <h2 className="public-listing-price">${listing.rent}<span className="public-listing-price-unit">/mo</span></h2>
            {/* UPDATED BUTTON ROUTING */}
            <button 
              onClick={handleContactOwner}
              className="public-listing-contact"
            >
              Message {listing.profiles?.firstname}
            </button>
          </div>

          <div className="public-listing-poster" onClick={() => navigate(`/profile/${listing.user_id}`)}>
            <p className="public-listing-meta">LISTED BY</p>
            <div className="public-listing-poster-row">
              <img src={listing.profiles?.profilepic_url} className="public-listing-avatar" alt="poster" />
              <div>
                <p className="public-listing-poster-name">{listing.profiles?.firstname} {listing.profiles?.lastname}</p>
                <p className="public-listing-poster-uni">{listing.profiles?.university}</p>
              </div>
            </div>
            <p className="public-listing-view-profile">View Profile →</p>
          </div>
        </div>
      </div>
    </div>
  );
}
