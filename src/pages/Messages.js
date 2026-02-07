import { useState } from "react";

export default function Messages() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "Alice", text: "Hey! Is your sublease still available?" },
    { from: "You", text: "Yes, it's available until August." },
  ]);

  function handleSend(e) {
    e.preventDefault();
    if (!message) return;

    // Add the new message
    setMessages([...messages, { from: "You", text: message }]);
    setMessage(""); // Clear input
  }

  return (
    <div style={{ display: "flex", height: "90vh", border: "1px solid #ccc" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ccc",
          padding: "15px",
          background: "#f9f9f9",
        }}
      >
        <h3>Contacts</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>Alice</li>
          <li>Bob</li>
          <li>Charlie</li>
        </ul>
      </div>

      {/* Message Feed */}
      <div style={{ flex: 1, padding: "15px", display: "flex", flexDirection: "column" }}>
        <h3>Chat</h3>
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            padding: "10px",
            overflowY: "auto",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          {messages.map((msg, index) => (
            <p key={index} style={{ margin: "5px 0" }}>
              <strong>{msg.from}:</strong> {msg.text}
            </p>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} style={{ display: "flex" }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "10px" }}
          />
          <button type="submit" style={{ padding: "10px" }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
