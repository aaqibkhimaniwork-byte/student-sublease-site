import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "error" | ""
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith(".edu")) {
      setMessage("❌ Please use a valid .edu email address.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          university: university.trim(),
        },
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
      setMessageType("error");
    } else {
      setMessage("✅ Success! Check your email for a link.");
      setMessageType("success");
    }

    setLoading(false);
  }

  return (
    <div className="signup-page">
      <h2 className="signup-title">Student Signup</h2>
      <p className="signup-subtitle">Only verified college students can join.</p>

      <form className="signup-form" onSubmit={handleSignup}>
        <input
          className="signup-input"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />

        <input
          className="signup-input"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />

        <input
          className="signup-input"
          placeholder="University (e.g. UGA)"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          required
        />

        <input
          className="signup-input"
          type="email"
          placeholder="Email (.edu)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="signup-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button className="signup-button" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <p className={`signup-message ${messageType}`}>{message}</p>
      )}
    </div>
  );
}
