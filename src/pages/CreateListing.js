import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function CreateListing() {
  const navigate = useNavigate();
  
  // Logic & Security states
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [images, setImages] = useState([]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (images.length < 1) {
      alert("Please upload at least one image.");
      return;
    }
    
    setLoading(true);

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
          universities: listingData.universities.split(",").map((u) => u.trim()),
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

  // 1. Wait for auth check to finish
  if (!authChecked) {
    return <div className="auth-container"><p>Loading...</p></div>;
  }

  // 2. If NOT logged in, show the restricted message
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-form" style={{ textAlign: "center" }}>
          <h2>Access Restricted</h2>
          <p>You need to be logged in to create a listing.</p>
          <button onClick={() => navigate("/login")} style={{ marginTop: "20px" }}>
            Log In Now
          </button>
          <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    );
  }

  // 3. If logged in, show the actual form
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
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
          <input name="universities" placeholder="Nearby Universities (comma separated)" value={listingData.universities} onChange={handleChange} required />
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

        <button type="submit" disabled={loading}>
          {loading ? "Saving Listing..." : "Add Listing"}
        </button>
      </form>
    </div>
  );
}