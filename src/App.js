import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

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
      {/* Simple Navbar */}
      <nav style={{ padding: "15px", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Signup</Link>
        <Link to="/login" style={{ marginRight: "15px" }}>Login</Link>
        <Link to="/home" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/create" style={{ marginRight: "15px" }}>Create Listing</Link>
        <Link to="/listings">Listings</Link>
        <Link to="/messages" style={{ marginLeft: "15px" }}>Messages</Link>
      </nav>
>>>>>>> 7b2d89ec7f57defe07c22afcf8febce33f90ac35

      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateListing addListing={addListing} />} />
        <Route path="/listings" element={<Listings listings={listings} />} />
        <Route path="/messages" element={<Messages />} />
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