const mongoose = require("mongoose");
require("dotenv").config();

const University = require("./models/University");
const Listing = require("./models/Listing");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Helper: Distance ---
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Connect MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --- Routes ---

// GET universities (dropdown/autocomplete)
app.get("/api/universities", async (req, res) => {
  try {
    const universities = await University.find();
    res.json(universities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

// GET listings (optionally filtered by university)
// GET listings (optionally filtered by university)
app.get("/api/listings", async (req, res) => {
  const { university } = req.query;

  try {
    const allListings = await Listing.find();

    if (university) {
      // Find the selected university's coordinates
      const selectedUni = await University.findOne({ name: university });
      if (!selectedUni) return res.json([]);

      // Filter listings within 15 miles of the selected university
      const filtered = allListings.filter(listing => {
        if (!listing.lat || !listing.lng) return false; // skip listings without coordinates

        const distance = getDistanceInMiles(
          selectedUni.lat,
          selectedUni.lng,
          listing.lat,
          listing.lng
        );

        return distance <= 15; // 15 miles radius
      });

      return res.json(filtered);
    }

    // If no university filter, return all listings
    res.json(allListings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});
// POST new listing
app.post("/api/listings", async (req, res) => {
  try {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save listing" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});