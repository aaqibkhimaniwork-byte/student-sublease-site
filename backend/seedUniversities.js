const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const University = require("./models/University");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

async function seedUniversities() {
  try {
    // Read JSON file
    const filePath = path.join(__dirname, "data", "universities.json");
    const data = fs.readFileSync(filePath, "utf8");
    const universities = JSON.parse(data);

    // Clear existing collection
    await University.deleteMany({});
    console.log("Old universities removed");

    // Insert new data
    await University.insertMany(universities);
    console.log(`Inserted ${universities.length} universities`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedUniversities();