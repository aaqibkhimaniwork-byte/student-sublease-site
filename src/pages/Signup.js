import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          firstname: firstname,
          lastname: lastname,
          university: university,
          // Notice: profilepic_url is GONE from here
        },
      },
    });

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage("✅ Success! Account created.");
    }
    setLoading(false);
  };

  return (
    <div className="signup-container" style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Join Student Sublease</h2>
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input type="text" placeholder="First Name" required value={firstname} onChange={(e) => setFirstname(e.target.value)} />
        <input type="text" placeholder="Last Name" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
        <input type="text" placeholder="University" required value={university} onChange={(e) => setUniversity(e.target.value)} />
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Creating Account..." : "Sign Up"}</button>
      </form>
      {message && <p style={{ color: message.includes("❌") ? "red" : "green" }}>{message}</p>}
    </div>
  );
};

export default Signup;