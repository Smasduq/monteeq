import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, Search, User, Key, Lock, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCrypto } from '../hooks/useCrypto';
import {
    getConversations,
    getChatMessages,
    sendChatMessage,
    getUserPublicKey,
    uploadPublicKey
} from '../api';
import { useAuth } from '../context/AuthContext';
import { ChatSkeleton } from '../components/Skeleton';

const Chat = () => {
    const { user, token } = useAuth();
    const { generateKeyPair, encryptMessage, decryptMessage, hasLocalKey, isGenerating } = useCrypto();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [decryptedMessages, setDecryptedMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [keysLoaded, setKeysLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recipientUsername, setRecipientUsername] = useState('');

    const messagesEndRef = useRef(null);

    const fetchConversations = async () => {
        try {
            const data = await getConversations(token);
            setConversations(data);
            setLoading(false);
            return data;
        } catch (error) {
            console.error('Failed to fetch conversations', error);
            setLoading(false);
            return [];
        }
    };

    const startChatInternal = async (target) => {
        try {
            const { public_key: recipientPubKey } = await getUserPublicKey(target, token);
            if (!recipientPubKey) {
                alert("Recipient hasn't set up E2EE yet.");
                return;
            }

            const encrypted = await encryptMessage("System: Chat Started", recipientPubKey, user.public_key);
            await sendChatMessage({
                ...encrypted,
                recipient_username: target
            }, token);

            setRecipientUsername('');
            const updatedConvs = await fetchConversations();
            const newConv = updatedConvs.find(c =>
                c.user1.username === target || c.user2.username === target
            );
            if (newConv) setSelectedConv(newConv);
        } catch (error) {
            console.error("Failed to start chat:", error);
        }
    };

    // Primary initialization effect
    useEffect(() => {
        const initChat = async () => {
            if (!user) return;

            const hasKey = await hasLocalKey();
            if (hasKey) {
                setKeysLoaded(true);
                const convs = await fetchConversations();

                // Handle navigation from Profile
                if (location.state?.startChatWith) {
                    const target = location.state.startChatWith;
                    const existing = convs.find(c =>
                        c.user1.username === target || c.user2.username === target
                    );
                    if (existing) {
                        setSelectedConv(existing);
                    } else {
                        await startChatInternal(target);
                    }
                    // Clear state after handling
                    navigate(location.pathname, { replace: true, state: {} });
                }
            } else {
                setLoading(false);
            }
        };
        initChat();
    }, [user, location.state]);

    // Message fetching and polling
    useEffect(() => {
        let interval;
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            interval = setInterval(() => fetchMessages(selectedConv.id), 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedConv]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async (convId) => {
        try {
            const data = await getChatMessages(convId, token);
            setMessages(data);

            // Decrypt messages
            for (const msg of data) {
                if (!decryptedMessages[msg.id]) {
                    try {
                        const wrappedKey = String(msg.sender_id) === String(user.id) ? msg.sender_key : msg.recipient_key;
                        const decrypted = await decryptMessage(msg.encrypted_content, msg.iv, wrappedKey);
                        setDecryptedMessages(prev => ({ ...prev, [msg.id]: decrypted }));
                    } catch (e) {
                        console.error('Failed to decrypt message', msg.id, e);
                        setDecryptedMessages(prev => ({ ...prev, [msg.id]: '[Decryption Failed]' }));
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleGenerateKeys = async () => {
        try {
            const publicKey = await generateKeyPair();
            await uploadPublicKey(publicKey, token);
            setKeysLoaded(true);
            const convs = await fetchConversations();

            // Check if we were redirected here from a profile
            if (location.state?.startChatWith) {
                const target = location.state.startChatWith;
                const existing = convs.find(c =>
                    c.user1.username === target || c.user2.username === target
                );
                if (existing) {
                    setSelectedConv(existing);
                } else {
                    await startChatInternal(target);
                }
            }
        } catch (error) {
            console.error('Key generation failed', error);
            alert("Failed to generate secure keys. Please try again.");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        const recipient = selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1;

        try {
            const { public_key: recipientPubKey } = await getUserPublicKey(recipient.username, token);
            if (!recipientPubKey) {
                alert("Recipient hasn't set up End-2-End Encrypted yet.");
                return;
            }

            const encrypted = await encryptMessage(newMessage, recipientPubKey, user.public_key);
            await sendChatMessage({
                ...encrypted,
                recipient_username: recipient.username
            }, token);

            setNewMessage('');
            fetchMessages(selectedConv.id);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleStartNewChat = async (e) => {
        e.preventDefault();
        if (!recipientUsername.trim()) return;

        if (recipientUsername === user.username) {
            alert("You cannot chat with yourself.");
            return;
        }

        await startChatInternal(recipientUsername);
        setRecipientUsername('');
    };

    if (loading) return <ChatSkeleton />;

    if (!keysLoaded) {
        return (
            <div className="chat-empty-state" style={{ padding: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="crypto-setup-card glass"
                >
                    <Shield size={64} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Secure End-to-End Chat</h2>
                    <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
                        To protect your privacy, Montage uses E2EE. Your messages are encrypted on your device and can only be read by you and the recipient.
                    </p>
                    <button
                        className="btn-active glass"
                        style={{ width: '100%', marginTop: '1rem', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer' }}
                        onClick={handleGenerateKeys}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating Keys...' : 'Generate Secure Keys'}
                    </button>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Lock size={14} /> Your private key never leaves your browser.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={20} color="var(--accent-primary)" /> Messages
                    </h2>
                    <form onSubmit={handleStartNewChat} style={{ marginTop: '1rem' }}>
                        <div className="message-input-container">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Find editor..."
                                value={recipientUsername}
                                onChange={(e) => setRecipientUsername(e.target.value)}
                            />
                        </div>
                    </form>
                </div>
                <div className="conversation-list">
                    {conversations.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                            No active chats.<br />Search for a username above to start chatting.
                        </div>
                    )}
                    {conversations.map(conv => {
                        const partner = conv.user1.username === user.username ? conv.user2 : conv.user1;
                        return (
                            <div
                                key={conv.id}
                                className={`conversation-item ${selectedConv?.id === conv.id ? 'active' : ''}`}
                                onClick={() => setSelectedConv(conv)}
                            >
                                <div className="avatar-placeholder-sm" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                    {(partner.profile_pic) ? (
                                        <img src={partner.profile_pic} className="avatar-img-sm" alt="" />
                                    ) : (
                                        partner.username[0].toUpperCase()
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {partner.username}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>E2EE Enabled</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chat-window">
                {selectedConv ? (
                    <>
                        <div className="chat-header">
                            <div className="avatar-placeholder-sm">
                                {(selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1).username[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>
                                    {(selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1).username}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Shield size={10} /> End-to-End Encrypted
                                </div>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.map(msg => (
                                <div key={msg.id} className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                                    {decryptedMessages[msg.id] || 'Decrypting...'}
                                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input-area">
                            <form onSubmit={handleSendMessage} className="message-input-container" style={{ padding: '0.6rem 1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Type a secure message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    autoComplete="off"
                                />
                                <button type="submit" className="btn-active" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="chat-empty-state" style={{ opacity: 0.4 }}>
                        <Shield size={64} style={{ marginBottom: '1rem' }} />
                        <h3>Your Privacy is Our Priority</h3>
                        <p>Select an editor to start a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
