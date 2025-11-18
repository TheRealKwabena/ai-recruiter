import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import './Messages.css';

interface Message {
  id: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  partner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      if (response.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0].partner.id);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await api.post('/messages', {
        receiverId: selectedConversation,
        content: messageInput,
      });
      setMessageInput('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="messages-page">
      <div className="messages-layout">
        <div className="conversations-list">
          <h1>Messages</h1>
          <input
            type="text"
            placeholder="Search"
            className="search-input"
          />
          <div className="conversations">
            {conversations.map((conv) => (
              <div
                key={conv.partner.id}
                className={`conversation-item ${
                  selectedConversation === conv.partner.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedConversation(conv.partner.id)}
              >
                <div className="conversation-avatar"></div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="conversation-name">
                      {conv.partner.firstName} {conv.partner.lastName}
                    </span>
                    <span className="conversation-date">
                      {format(new Date(conv.lastMessage.createdAt), 'MMM dd')}
                    </span>
                  </div>
                  <p className="conversation-preview">
                    {conv.lastMessage.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedConversation && (
          <div className="chat-window">
            <ChatHeader
              partner={
                conversations.find((c) => c.partner.id === selectedConversation)?.partner
              }
            />
            <div className="chat-messages">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Type your Message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="message-input"
              />
              <div className="chat-actions">
                <button className="icon-btn">😊</button>
                <button className="icon-btn">📎</button>
                <button className="icon-btn" onClick={sendMessage}>✈️</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatHeaderProps {
  partner?: {
    firstName: string;
    lastName: string;
  };
}

const ChatHeader = ({ partner }: ChatHeaderProps) => {
  if (!partner) return null;

  return (
    <div className="chat-header">
      <div className="chat-avatar"></div>
      <div>
        <div className="chat-name">
          {partner.firstName} {partner.lastName}
        </div>
        <div className="chat-location">New York</div>
      </div>
    </div>
  );
};

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const { user } = useAuthStore();
  const isOwn = message.sender.id === user?.id;

  return (
    <div className={`chat-bubble ${isOwn ? 'own' : ''}`}>
      {message.content}
    </div>
  );
};

export default Messages;

