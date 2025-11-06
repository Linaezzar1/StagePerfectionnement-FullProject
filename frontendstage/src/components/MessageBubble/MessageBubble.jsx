import React, { useState, useEffect } from 'react'; 
import { FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import './MessageBubble.css';

const MessageBubble = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [ws, setWs] = useState(null);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/message/getmessagebyUserId`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log(response.data)
        setChatHistory(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
      }
    };

    fetchMessages();

    const socket = new WebSocket(`ws://localhost:3000/?userId=${userId}`);
    setWs(socket);

    socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setChatHistory((prev) => [...prev, messageData]);
    };

    return () => socket.close();
  }, [userId]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      
      const messageData = { content: message, sender: userId, targetUserId: '6795011f3db4b769030acfed' };

      try {
        await axios.post('http://localhost:3000/message/createmessage', messageData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (ws) {
          ws.send(JSON.stringify(messageData));
        }

        setChatHistory((prev) => [...prev, { sender: userId, content: message }]);
        setMessage('');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message :', error);
      }
    }
  };

  return (
    <div className="message-bubble-container">
      <div className={`chat-popup ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">Messages</div>
        <div className="chat-body">
          {chatHistory.map((msg, index) => (
            <div 
              key={msg._id || index} 
              className={`chat-message ${msg.sender?.role != 'admin'  ? 'sent' : 'received'}`}>
              <strong>{msg.sender?.role != 'admin' ? 'Moi' : (msg.sender?.role === 'admin' ? 'Admin' : 'Utilisateur')}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrire un message..."
          />
          <button onClick={handleSendMessage}>Envoyer</button>
        </div>
      </div>

      <div className="message-icon" onClick={toggleChat}>
        <FiMessageSquare size={28} color="white" />
      </div>
    </div>
  );
};

export default MessageBubble;