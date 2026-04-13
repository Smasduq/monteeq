import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Smartphone, Monitor } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceRecorder from './VoiceRecorder';

const ChatWindow = ({ 
    selectedConv, 
    messages, 
    decryptedMessages, 
    user, 
    onSendMessage, 
    onSendVoice, 
    onUploadFile,
    onDownloadFile
}) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendText = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (!selectedConv) {
        return (
            <div className="chatEmptyState">
                <Monitor size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                <h3>Elite Creator Workspace</h3>
                <p>Select a contact to begin a secure, encrypted session.</p>
            </div>
        );
    }

    const partner = selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1;

    return (
        <div className="chatMain">
            <div className="chatHeader">
                <div className="avatar-md">
                    {partner.profile_pic ? <img src={partner.profile_pic} alt="" /> : partner.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div className="partner-name">{partner.username}</div>
                    <div className="partner-status">Active Workspace Session</div>
                </div>
                <div className="headerActions">
                    <MoreVertical size={20} className="actionBtn" />
                </div>
            </div>

            <div className="messagesContainer">
                {messages.map(msg => (
                    <MessageBubble 
                        key={msg.id}
                        message={msg}
                        isSent={msg.sender_id === user.id}
                        decryptedContent={decryptedMessages[msg.id]}
                        onDownloadFile={onDownloadFile}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="inputArea">
                <div className="inputWrapper">
                    <label className="actionBtn">
                        <Paperclip size={20} />
                        <input 
                            type="file" 
                            style={{ display: 'none' }} 
                            onChange={(e) => onUploadFile(e.target.files[0])} 
                        />
                    </label>
                    <form onSubmit={handleSendText} style={{ flex: 1, display: 'flex' }}>
                        <input 
                            type="text" 
                            placeholder="Type a secure message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                    </form>
                    <VoiceRecorder onSendVoice={onSendVoice} />
                    <button className="actionBtn" onClick={handleSendText}>
                        <Send size={20} color="var(--accent-primary)" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
