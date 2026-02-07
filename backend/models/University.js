const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
});

module.exports = mongoose.model("University", UniversitySchema);