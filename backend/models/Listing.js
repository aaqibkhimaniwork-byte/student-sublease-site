const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: String,
  pets: Boolean,
  sqft: Number,
  rent: Number,
  parking: Boolean,
  university: String,
});

module.exports = mongoose.model("Listing", ListingSchema);