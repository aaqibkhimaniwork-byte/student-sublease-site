export default function Home() {
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

  return (
    <div style={{ padding: "30px" }}>
      <h2>Available Subleases</h2>

      {listings.map((listing) => (
        <div
          key={listing.id}
          style={{
            border: "1px solid gray",
            padding: "15px",
            marginTop: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>{listing.title}</h3>
          <p>Rent: ${listing.rent}/month</p>
          <p>Distance: {listing.distance}</p>
        </div>
      ))}
    </div>
  );
}