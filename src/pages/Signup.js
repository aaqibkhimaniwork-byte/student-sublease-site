import { useState } from "react";
import { supabase } from "../supabaseClient"; 

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    if (!email.endsWith(".edu")) {
      setMessage("❌ Please use a valid college (.edu) email address.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { firstname: firstname }
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Success! Check your email.");
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Signup</h2>
      <p>Only verified college students can join.</p>

      <form onSubmit={handleSignup} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
          style={{ padding: "10px", width: "150px" }}
        />
        <input
          type="email"
          placeholder="Enter your .edu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", width: "250px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", width: "150px" }}
        />

        <button style={{ padding: "10px" }} disabled={loading}>
          {loading ? "..." : "Sign Up"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>{message}</p>
    </div>
  );
}