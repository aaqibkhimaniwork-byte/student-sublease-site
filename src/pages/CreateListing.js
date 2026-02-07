import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import "../styles/CreateListing.css";

export default function CreateListing() {
  const navigate = useNavigate();
  
  // Logic & Security states
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [images, setImages] = useState([]);

  const [uniOptions, setUniOptions] = useState([]);
  const [uniQuery, setUniQuery] = useState("");

  // Form states
  const [listingData, setListingData] = useState({
    title: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    universities: "",
    sqft: "",
    rent: "",
    lease_start: "",
    lease_end: "",
    pets: false,
    parking: false,
    furnished: false,
    description: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: verifiedUser } } = await supabase.auth.getUser();
      if (verifiedUser) {
        setUser(verifiedUser);
      }
      setAuthChecked(true);
    };
    checkUser();
  }, []);

  useEffect(() => {
  async function fetchUniversities() {
    try {
      const res = await fetch("http://localhost:5000/api/universities");
      const data = await res.json();
      setUniOptions(data);
    } catch (err) {
      console.log("Error fetching universities:", err);
    }
  }

  fetchUniversities();
}, []);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setListingData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed.");
      return;
    }
    setImages([...images, ...files]);
  };

  async function geocodeAddress(address) {
  const token = process.env.REACT_APP_MAPBOX_TOKEN;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${token}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Address not found");
  }

  // Mapbox returns [lng, lat]
  const [lng, lat] = data.features[0].center;

  return { lat, lng };
}

  async function handleSubmit(e) {
    e.preventDefault();
    if (images.length < 1) {
      alert("Please upload at least one image.");
      return;
    }

    const fullAddress = `${listingData.street_address}, ${listingData.city}, ${listingData.state} ${listingData.zip_code}`;
    
    setLoading(true);

    let coordinates;

    try {
        coordinates = await geocodeAddress(fullAddress);
        console.log("Coordinates:", coordinates);
    } catch (err) {
        alert("Could not find location for this address.");
        return;
    }

    try {
      const imageUrls = [];
      for (const file of images) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("ListingImages")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("ListingImages")
          .getPublicUrl(filePath);
        
        imageUrls.push(publicUrl);
      }

      const { error: insertError } = await supabase.from("listings").insert([
        {
          user_id: user.id,
          title: listingData.title,
          street_address: listingData.street_address,
          city: listingData.city,
          state: listingData.state,
          zip_code: listingData.zip_code,
          rent: parseInt(listingData.rent),
          sq_ft: parseInt(listingData.sqft),

          lat: coordinates.lat,
          lng: coordinates.lng,

          universities: [listingData.universities],   
          lease_start: listingData.lease_start,
          lease_end: listingData.lease_end,
          parking_available: listingData.parking,
          pets_allowed: listingData.pets,
          furnished: listingData.furnished,
          description: listingData.description,
          image_urls: imageUrls,
        },
      ]);

      if (insertError) throw insertError;

      alert("Listing posted successfully!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
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
      <div className="splash-outer create-page">
        <div className="splash-inner">
          {renderHeader()}
          <main className="splash-main">
            <section className="create-shell">
              <div className="create-content">
                {content}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // 1. Wait for auth check to finish
  if (!authChecked) {
    return renderShell(<div className="create-empty">Loading...</div>);
  }

  // 2. If NOT logged in, show the restricted message
  if (!user) {
    return renderShell(
      <div className="auth-form create-form" style={{ textAlign: "center" }}>
        <h2>Access Restricted</h2>
        <p>You need to be logged in to create a listing.</p>
        <button onClick={() => navigate("/login")} className="create-primary">
          Log In Now
        </button>
        <p className="create-muted">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    );
  }

  // 3. If logged in, show the actual form
  return renderShell(
    <form className="auth-form create-form" onSubmit={handleSubmit}>
      <h2>Create a New Listing</h2>
        
        <section>
          <p><strong>Property Basics</strong></p>
          <input name="title" placeholder="Listing Title" value={listingData.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Description (Optional)" value={listingData.description} onChange={handleChange} />
        </section>

        <section>
          <p><strong>Address</strong></p>
          <input name="street_address" placeholder="Street Address" value={listingData.street_address} onChange={handleChange} required />
          <input name="city" placeholder="City" value={listingData.city} onChange={handleChange} required />
          <input name="state" placeholder="State" value={listingData.state} onChange={handleChange} required />
          <input name="zip_code" placeholder="Zip Code" value={listingData.zip_code} onChange={handleChange} required />
        </section>

        <section>
          <p><strong>Details</strong></p>
<label><strong>Nearby University</strong></label>

    <input
  placeholder="Start typing a university..."
  value={uniQuery}
  onChange={(e) => setUniQuery(e.target.value)}
  required
    />

    {/* Suggestions dropdown */}
    {uniQuery.length > 1 && (
    <div
        style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      background: "white",
      maxHeight: "150px",
      overflowY: "auto",
      marginTop: "5px",
      padding: "5px",
        }}
    >
        {uniOptions
        .filter((u) =>
            u.name.toLowerCase().includes(uniQuery.toLowerCase())
      )
        .slice(0, 6)
        .map((u) => (
            <p
            key={u._id}
            style={{
                padding: "6px",
                cursor: "pointer",
                margin: 0,
            }}
            onClick={() => {
                setListingData((prev) => ({
                ...prev,
                universities: u.name,
                }));
                setUniQuery(u.name);
            }}
            >
            {u.name}
            </p>
        ))}
    </div>
)}
          <input type="number" name="rent" placeholder="Monthly Rent ($)" value={listingData.rent} onChange={handleChange} required />
          <input type="number" name="sqft" placeholder="Square Footage" value={listingData.sqft} onChange={handleChange} required />
        </section>

        <section>
          <p><strong>Lease Term</strong></p>
          <label>Start: <input type="date" name="lease_start" value={listingData.lease_start} onChange={handleChange} required /></label>
          <br />
          <label>End: <input type="date" name="lease_end" value={listingData.lease_end} onChange={handleChange} required /></label>
        </section>

        <section>
          <p><strong>Amenities</strong></p>
          <label><input type="checkbox" name="pets" checked={listingData.pets} onChange={handleChange} /> Pets Allowed</label><br/>
          <label><input type="checkbox" name="parking" checked={listingData.parking} onChange={handleChange} /> Parking Available</label><br/>
          <label><input type="checkbox" name="furnished" checked={listingData.furnished} onChange={handleChange} /> Furnished</label>
        </section>

        <section>
          <p><strong>Photos</strong></p>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          <p>{images.length} of 5 images selected</p>
        </section>

      <button type="submit" disabled={loading} className="create-primary">
        {loading ? "Saving Listing..." : "Add Listing"}
      </button>
    </form>
  );
}