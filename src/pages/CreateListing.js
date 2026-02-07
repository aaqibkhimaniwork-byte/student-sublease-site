import { useState } from "react";

export default function CreateListing({ addListing }) {
  const [listingData, setListingData] = useState({
    title: "",
    pets: false,
    sqft: "",
    rent: "",
    parking: false,
  });

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setListingData({
      ...listingData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newListing = {
      ...listingData,
      id: Date.now(),
      sqft: Number(listingData.sqft),
      rent: Number(listingData.rent),
    };

    addListing(newListing);

    // Reset form
    setListingData({
      title: "",
      pets: false,
      sqft: "",
      rent: "",
      parking: false,
    });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Listing</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title: <input name="title" value={listingData.title} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Pets allowed: <input type="checkbox" name="pets" checked={listingData.pets} onChange={handleChange} />
        </label>
        <br />
        <label>
          Square feet: <input type="number" name="sqft" value={listingData.sqft} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Rent: <input type="number" name="rent" value={listingData.rent} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Parking available: <input type="checkbox" name="parking" checked={listingData.parking} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">Add Listing</button>
      </form>
    </div>
  );
}
