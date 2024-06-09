import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";
let socket;

const Chat = ({ user, chat }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('joinChat', chat._id);

        socket.on('messageReceived', (newMessageReceived) => {
            setMessages([...messages, newMessageReceived]);
        });

        socket.on('typing', (userId) => {
            if (userId !== user._id) {
                setIsTyping(true);
            }
        });

        socket.on('stopTyping', (userId) => {
            if (userId !== user._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.disconnect();
            socket.off();
        }
    }, [chat._id, messages]);

    const sendMessage = (e) => {
        e.preventDefault();

        if (newMessage.trim()) {
            socket.emit('stopTyping', chat._id, user._id);
            socket.emit('newMessage', { sender: user, content: newMessage, chat });

            setMessages([...messages, { sender: user, content: newMessage, chat }]);
            setNewMessage("");
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!typing) {
            setTyping(true);
            socket.emit('typing', chat._id, user._id);
        }

        let lastTypingTime = (new Date()).getTime();
        setTimeout(() => {
            let timeNow = (new Date()).getTime();
            let timeDiff = timeNow - lastTypingTime;

            if (timeDiff >= 3000 && typing) {
                socket.emit('stopTyping', chat._id, user._id);
                setTyping(false);
            }
        }, 3000);
    };

    return (
        <div>
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender.username}: </strong>{msg.content}
                    </div>
                ))}
            </div>
            {isTyping && <div>Someone is typing...</div>}
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
