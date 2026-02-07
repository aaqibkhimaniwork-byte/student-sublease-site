import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

import SplashPage from "./pages/SplashPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateListing from "./pages/CreateListing";

export default function App() {
  return (
    <BrowserRouter>
      <TopBarIfNotSplash />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateListing />} />
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
      <Link to="/home" style={{ marginRight: "15px" }}>Listings</Link>
      <Link to="/create">Post Listing</Link>
    </nav>
  );
}