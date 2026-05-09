import { useState, useEffect, useRef } from 'react';
import { messageAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messageAPI.getConversations().then(res => setConversations(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      messageAPI.getMessages(selectedUser.user_id).then(res => setMessages(res.data));
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    await messageAPI.send({ receiver_id: selectedUser.user_id, content: newMessage });
    setNewMessage('');
    const res = await messageAPI.getMessages(selectedUser.user_id);
    setMessages(res.data);
    const convRes = await messageAPI.getConversations();
    setConversations(convRes.data);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date + 'Z');
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Messages</h1>
      <div className="messages-container">
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <MessageSquare size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.user_id} className={`conversation-item ${selectedUser?.user_id === conv.user_id ? 'active' : ''}`} onClick={() => setSelectedUser(conv)}>
                <div className="conversation-avatar">{getInitials(conv.name)}</div>
                <div className="conversation-info">
                  <div className="conversation-name">{conv.name}</div>
                  <div className="conversation-last">{conv.last_message || 'Start a conversation'}</div>
                </div>
                {conv.unread_count > 0 && <div className="unread-badge">{conv.unread_count}</div>}
              </div>
            ))
          )}
        </div>

        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="conversation-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>{getInitials(selectedUser.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{selectedUser.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedUser.university}</div>
                  </div>
                </div>
              </div>
              <div className="chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                    <div>{msg.content}</div>
                    <div className="message-time">{formatTime(msg.created_at)}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={handleSend}>
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
                <button type="submit"><Send size={18} /></button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <div style={{ textAlign: 'center' }}>
                <MessageSquare size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
