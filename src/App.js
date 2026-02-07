import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateListing from "./pages/CreateListing";

export default function App() {
  return (
    <BrowserRouter>
      {/* Simple Navbar */}
      <nav style={{ padding: "15px", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Signup</Link>
        <Link to="/login" style={{ marginRight: "15px" }}>Login</Link>
        <Link to="/home" style={{ marginRight: "15px" }}>Listings</Link>
        <Link to="/create">Post Listing</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateListing />} />
      </Routes>
    </BrowserRouter>
  );
}