import { useState } from "react";
import { supabase } from "../supabaseClient"; 
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Login successful!");
      // Redirecting to dashboard
      setTimeout(() => navigate("/dashboard"), 1000);
    }
    setLoading(false);
  }

  // Exact same style object from your Signup page
  const inputStyle = { 
    padding: "10px", 
    width: "300px", 
    display: "block", 
    marginBottom: "10px" 
  };

  return (
    <div style={{ padding: "30px" }}>
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
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
      
      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}