import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const activeChatRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUser(user);
    await loadInbox();
    subscribeToRealtime(user.id);
    setLoading(false);
  }

  async function loadInbox() {
    const { data, error } = await supabase
      .from("inbox_threads")
      .select(`
        conversation_id,
        last_message,
        created_at,
        sender:sender_id(id, firstname, lastname, profilepic_url),
        receiver:receiver_id(id, firstname, lastname, profilepic_url)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Inbox load error:", error);
      return;
    }

    setConversations(data || []);
  }

  function subscribeToRealtime(userId) {
    // Listen to ALL messages where current user is sender OR receiver
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          const chat = activeChatRef.current;

          // Update inbox preview
          loadInbox();

          // If user is viewing the chat, append it
          if (chat && payload.new.conversation_id === chat.conversation_id) {
            setMessages((prev) => {
              const index = prev.findIndex(
                (m) => m.client_id && m.client_id === payload.new.client_id
              );

              if (index !== -1) {
                const copy = [...prev];
                copy[index] = payload.new;
                return copy;
              }

              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async function loadConversation(chat) {
    setActiveChat(chat);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", chat.conversation_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Conversation load error:", error);
      return;
    }

    setMessages(data || []);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const clientId = crypto.randomUUID();

    const optimisticMessage = {
      id: clientId,
      client_id: clientId,
      conversation_id: activeChat.conversation_id,
      sender_id: currentUser.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      optimistic: true
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    const recipientId =
      activeChat.sender.id === currentUser.id
        ? activeChat.receiver.id
        : activeChat.sender.id;

    const { error } = await supabase.from("messages").insert([{
      client_id: clientId,
      conversation_id: activeChat.conversation_id,
      sender_id: currentUser.id,
      receiver_id: recipientId,
      content: optimisticMessage.content
    }]);

    if (error) {
      console.error("Send message error:", error);
    }
  }

  if (loading) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading chats...</div>;
  }

  if (!currentUser) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h2>Your Inbox</h2>
        <p>Please log in to view and send messages.</p>
        <button onClick={() => navigate("/login")} style={sendBtnStyle}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <h3 style={{ padding: "0 20px" }}>Messages</h3>

        {conversations.length === 0 ? (
          <p style={{ padding: "20px", color: "#888" }}>
            No conversations yet.
          </p>
        ) : (
          conversations.map((chat) => {
            const otherUser =
              chat.sender.id === currentUser.id ? chat.receiver : chat.sender;

            return (
              <div
                key={chat.conversation_id}
                onClick={() => loadConversation(chat)}
                style={{
                  ...convItemStyle,
                  background:
                    activeChat?.conversation_id === chat.conversation_id
                      ? "#e3f2fd"
                      : "transparent"
                }}
              >
                <img src={otherUser.profilepic_url} style={avatarStyle} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: "bold" }}>
                    {otherUser.firstname} {otherUser.lastname}
                  </div>
                  <div style={lastMsgStyle}>{chat.last_message}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={chatWindowStyle}>
        {activeChat ? (
          <>
            <div style={chatHeader}>
              <strong>
                Chatting with{" "}
                {activeChat.sender.id === currentUser.id
                  ? activeChat.receiver.firstname
                  : activeChat.sender.firstname}
              </strong>
            </div>

            <div style={messageListStyle}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...messageBubbleStyle,
                    alignSelf:
                      msg.sender_id === currentUser.id
                        ? "flex-end"
                        : "flex-start",
                    background:
                      msg.sender_id === currentUser.id ? "#0984e3" : "#f1f0f0",
                    color: msg.sender_id === currentUser.id ? "white" : "black"
                  }}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} style={inputAreaStyle}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={inputStyle}
              />
              <button type="submit" style={sendBtnStyle}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={emptyStateStyle}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const containerStyle = { display: "flex", height: "calc(100vh - 80px)", maxWidth: "1200px", margin: "0 auto", border: "1px solid #ddd", background: "white" };
const sidebarStyle = { width: "300px", borderRight: "1px solid #ddd", overflowY: "auto", background: "#f9f9f9" };
const convItemStyle = { display: "flex", gap: "12px", padding: "15px", cursor: "pointer", borderBottom: "1px solid #eee", alignItems: "center" };
const avatarStyle = { width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" };
const lastMsgStyle = { fontSize: "13px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const chatWindowStyle = { flex: 1, display: "flex", flexDirection: "column", background: "white" };
const chatHeader = { padding: "15px 20px", borderBottom: "1px solid #eee" };
const messageListStyle = { flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" };
const messageBubbleStyle = { maxWidth: "70%", padding: "10px 15px", borderRadius: "18px", fontSize: "14px" };
const inputAreaStyle = { padding: "20px", borderTop: "1px solid #eee", display: "flex", gap: "10px" };
const inputStyle = { flex: 1, padding: "12px", borderRadius: "25px", border: "1px solid #ddd", outline: "none" };
const sendBtnStyle = { padding: "0 20px", background: "#0984e3", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer" };
const emptyStateStyle = { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#888" };
