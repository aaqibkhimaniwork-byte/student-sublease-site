import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; 
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Login successful!");
      setTimeout(() => navigate("/home"), 1000);
    }
    setLoading(false);
  }

  const inputStyle = { 
    padding: "10px", 
    width: "300px", 
    display: "block", 
    marginBottom: "10px" 
  };

  // --- UI FOR LOGGED IN USERS ---
  if (session) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#2d3436" }}>You are already logged in</h2>
        <p style={{ color: "#636e72" }}>Welcome back, <strong>{session.user.email}</strong></p>
        
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "15px" }}>
          <button 
            onClick={() => navigate("/listings")}
            style={{ 
              padding: "12px 24px", 
              cursor: "pointer", 
              background: "#0984e3", 
              color: "white", 
              border: "none", 
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            Look at Listings
          </button>
          
          <button 
            onClick={async () => { await supabase.auth.signOut(); setSession(null); }}
            style={{ 
              padding: "12px 24px", 
              cursor: "pointer", 
              background: "transparent", 
              color: "#d63031", 
              border: "2px solid #d63031", 
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD LOGIN UI ---
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2>Student Login</h2>
      <p>Log in to your account to manage subleases.</p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email (.edu)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: "10px", 
            width: "324px", 
            cursor: "pointer",
            backgroundColor: loading ? "#ccc" : "#0984e3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold"
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {message && (
        <p style={{ 
          marginTop: "15px", 
          color: message.startsWith("Error") ? "#d63031" : "#00b894",
          fontWeight: "500"
        }}>
          {message}
        </p>
      )}
      
      <p style={{ marginTop: "20px", fontSize: "14px", color: "#636e72" }}>
        Don't have an account? <Link to="/signup" style={{ color: "#0984e3", fontWeight: "bold", textDecoration: "none" }}>Sign up here</Link>
      </p>
    </div>
  );
}