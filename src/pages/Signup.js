import { useState } from "react";
import { supabase } from "../supabaseClient"; 
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NEW: State for confirmation
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. EDU Email Validation
    if (!email.endsWith(".edu")) {
      setMessage("❌ Please use a valid .edu email address.");
      setLoading(false);
      return;
    }

    // 2. NEW: Password Confirmation Check
    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          firstname: firstname,
          lastname: lastname,
          university: university,
        },
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      // UPDATED: Patient confirmation message
      setMessage("✅ Success! Please check your email for a confirmation link. Please be patient, as it may take up to 1 minute to arrive.");
    }
    setLoading(false);
  }

  const inputStyle = { 
    padding: "10px", 
    width: "300px", 
    display: "block", 
    marginBottom: "10px" 
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h2>Student Signup</h2>
      <p>Only verified college students can join.</p>

      <form onSubmit={handleSignup}>
        <input
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="University (e.g. UGA)"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          required
          style={inputStyle}
        />
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
        {/* NEW: Confirm Password Input */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            backgroundColor: "#0984e3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold"
          }}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <div style={{ 
          marginTop: "15px", 
          maxWidth: "324px", 
          lineHeight: "1.4",
          color: message.includes("✅") ? "#2d3436" : "#d63031" 
        }}>
          {message}
        </div>
      )}
    </div>
  );
}