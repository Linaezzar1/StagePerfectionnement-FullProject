import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Message.css';

const Message = () => {
    const [users, setUsers] = useState([]); // List of users who have messaged
    const [selectedUser, setSelectedUser] = useState(null); // Current chat user
    const [chatHistory, setChatHistory] = useState([]); // Messages
    const [message, setMessage] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Fetch users who have messaged the admin
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/message/getUsersForAdmin', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            // Fetch chat history when a user is selected
            const fetchMessages = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/message/getmessagebyUserId/${selectedUser._id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    console.log(response.data);
                    
                    setChatHistory(response.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };

            fetchMessages();

            // Setup WebSocket connection
            const socket = new WebSocket(`ws://localhost:3000/?admin=true`);
            setWs(socket);

            socket.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                if (messageData.sender === selectedUser._id) {
                    setChatHistory((prev) => [...prev, messageData]);
                }
            };

            return () => socket.close();
        }
    }, [selectedUser]);

    const handleSendMessage = async () => {
        if (message.trim() && selectedUser) {
            const messageData = { content: message, sender: 'admin', targetUserId: selectedUser._id };

            try {
                await axios.post('http://localhost:3000/message/createmessage', messageData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (ws) {
                    ws.send(JSON.stringify(messageData));
                }

                setChatHistory((prev) => [...prev, { sender: 'admin', content: message }]);
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div className="container-fluid h-100">
            <div className="row justify-content-center h-100">
                {/* User List */}
                <div className="col-md-4 col-xl-3 chat">
                    <div className="card contacts_card">
                        <div className="card-header">
                            <h5>Users</h5>
                        </div>
                        <div className="card-body contacts_body">
                            <ul className="contacts">
                                {users.map((user) => (
                                    <li key={user._id} onClick={() => setSelectedUser(user)} className={selectedUser?._id === user._id ? 'active' : ''}>
                                        <div className="d-flex bd-highlight">
                                            <div className="user_info">
                                                <span>{user.fullname}</span>
                                                <p>{user.email}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-md-8 col-xl-6 chat">
                    <div className="card">
                        {selectedUser ? (
                            <>
                                <div className="card-header">
                                    <h5>Chat with {selectedUser.fullname}</h5>
                                </div>
                                <div className="card-body msg_card_body">
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`d-flex ${(!msg.sender?.role || msg.sender?.role === 'admin') ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div className={`msg_cotainer${(!msg.sender?.role || msg.sender?.role === 'admin') ? '_send' : ''}`}>
                                                {msg.content}
                                                <span className="msg_time">{new Date().toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="card-footer">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="form-control"
                                    />
                                    <button onClick={handleSendMessage} className="btn btn-primary">Send</button>
                                </div>
                            </>
                        ) : (
                            <div className="card-body">
                                <h5>Select a user to start chatting</h5>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;