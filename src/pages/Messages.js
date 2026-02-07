import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import home from "../assets/House Icon.webp";
import "../styles/SplashPage.css";
import "../styles/Messages.css";

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

  function renderHeader() {
    return (
      <header className="splash-header">
        <div className="header-content">
          <div className="title-wrap">
            <Link to="/listings" className="logo-link">
              <img src={home} alt="House Icon" className="title-icon" />
              <h1 className="app-title">Easy Lease</h1>
            </Link>
          </div>
          <nav className="main-nav" aria-label="primary">
            <ul>
              <li><Link to="/">Listings</Link></li>
              <li><Link to="/create">Create a Listing</Link></li>
              <li><Link to="/messages">Messages</Link></li>
            </ul>
          </nav>
          <div className="auth-wrap">
            {currentUser ? (
              <Link to="/myprofile" className="contact-button">
                My Profile
              </Link>
            ) : (
              <Link to="/login" className="contact-button">
                Log In/ Sign up
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  if (loading) {
    return (
      <div className="splash-outer messages-page">
        <div className="splash-inner">
          {renderHeader()}
          <main className="splash-main">
            <div className="messages-empty">
              Loading chats...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="splash-outer messages-page">
        <div className="splash-inner">
          {renderHeader()}
          <main className="splash-main">
            <div className="messages-empty">
              <h2>Your Inbox</h2>
              <p>Please log in to view and send messages.</p>
              <button onClick={() => navigate("/login")} className="messages-primary">
                Go to Login
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="splash-outer messages-page">
      <div className="splash-inner">
        {renderHeader()}
        <main className="splash-main">
          <section className="messages-shell">
            <aside className="messages-sidebar">
              <h3 className="messages-title">Messages</h3>

              {conversations.length === 0 ? (
                <p className="messages-muted">No conversations yet.</p>
              ) : (
                conversations.map((chat) => {
                  const otherUser =
                    chat.sender.id === currentUser.id ? chat.receiver : chat.sender;
                  const isActive = activeChat?.conversation_id === chat.conversation_id;

                  return (
                    <button
                      key={chat.conversation_id}
                      onClick={() => loadConversation(chat)}
                      className={`conversation-item${isActive ? " active" : ""}`}
                      type="button"
                    >
                      <img src={otherUser.profilepic_url} alt="Profile" className="conversation-avatar" />
                      <div className="conversation-body">
                        <div className="conversation-name">
                          {otherUser.firstname} {otherUser.lastname}
                        </div>
                        <div className="conversation-preview">{chat.last_message}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </aside>

            <section className="messages-chat">
              {activeChat ? (
                <>
                  <div className="chat-header">
                    <strong>
                      Chatting with{" "}
                      {activeChat.sender.id === currentUser.id
                        ? activeChat.receiver.firstname
                        : activeChat.sender.firstname}
                    </strong>
                  </div>

                  <div className="chat-messages">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`message-bubble ${isOwn ? "own" : "other"}`}
                        >
                          {msg.content}
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="chat-input">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="chat-text"
                    />
                    <button type="submit" className="messages-primary">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="messages-empty">
                  Select a conversation to start messaging
                </div>
              )}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
