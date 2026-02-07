import { useState } from "react";
import { supabase } from "../supabaseClient"; 

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email.endsWith(".edu")) {
      setMessage("❌ Please use a valid .edu email address.");
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
      setMessage("✅ Success! Check your email for a link.");
    }
    setLoading(false);
  }

  // This ensures they stay vertical
  const inputStyle = { 
    padding: "10px", 
    width: "300px", 
    display: "block", 
    marginBottom: "10px" 
  };

  return (
    <div style={{ padding: "30px" }}>
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

        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: "10px", width: "324px", cursor: "pointer" }}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}