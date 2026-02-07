import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

import SplashPage from "./pages/SplashPage";
import CreateListing from "./pages/CreateListing";
import Listings from "./pages/Listings";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import MyProfile from "./pages/MyProfile";
import PublicProfile from "./pages/PublicProfile";
import PublicListing from "./pages/PublicListing";

export default function App() {
  const [listings, setListings] = useState([
    { id: 1, title: "Apartment near campus", pets: true, sqft: 500, rent: 850 },
    { id: 2, title: "Private room in shared house", pets: false, sqft: 400, rent: 650 },
    { id: 3, title: "Studio apartment", pets: true, sqft: 300, rent: 900 },
  ]);

  function addListing(newListing) {
    setListings([...listings, newListing]);
  }

  return (
    <BrowserRouter>
      <TopBarIfNotSplash />

      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateListing addListing={addListing} />} />
        <Route path="/listings" element={<Listings listings={listings} />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/listing/:id" element={<PublicListing />} />
      </Routes>
    </BrowserRouter>
  );
}

function TopBarIfNotSplash() {
  const location = useLocation();
  if (location.pathname === "/") return null;

  return (
    <nav style={{ padding: "15px", background: "#eee" }}>
      <Link to="/signup" style={{ marginRight: "15px" }}>Signup</Link>
      <Link to="/login" style={{ marginRight: "15px" }}>Login</Link>
      <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
      <Link to="/create" style={{ marginRight: "15px" }}>Create Listing</Link>
      <Link to="/listings" style={{ marginRight: "15px" }}>Listings</Link>
      <Link to="/myprofile" style={{ marginRight: "15px" }}>My Profile</Link>
      <Link to="/messages">Messages</Link>
    </nav>
  );
}
