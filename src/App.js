import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashPage from "./pages/SplashPage";
import CreateListing from "./pages/CreateListing";
import Listings from "./pages/Listings";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
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

      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
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


