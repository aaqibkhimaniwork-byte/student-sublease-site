import { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSignup(e) {
    e.preventDefault();

    // Verify .edu email
    if (!email.endsWith(".edu")) {
      setMessage("❌ Please use a valid college (.edu) email address.");
      return;
    }

    setMessage("✅ College email verified! Signup can continue.");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Signup</h2>
      <p>Only verified college students can join.</p>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Enter your .edu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", width: "250px" }}
        />

        <button style={{ marginLeft: "10px", padding: "10px" }}>
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>{message}</p>
    </div>
  );
}