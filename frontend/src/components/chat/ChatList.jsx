import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, ShieldCheck } from 'lucide-react';

const ChatList = ({ conversations, selectedId, onSelect, user, onSearch, searchTerm }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="chatSidebar"
        >
            <div className="sidebarHeader">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Chats</h2>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ShieldCheck size={20} color="var(--accent-primary)" />
                    </motion.div>
                </div>
                <div className="searchBox">
                    <Search size={18} color="rgba(255,255,255,0.3)" />
                    <input 
                        type="text" 
                        placeholder="Search workspace..." 
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="conversation-list" style={{ flex: 1, overflowY: 'auto' }}>
                <AnimatePresence>
                    {conversations.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="empty-chat-list"
                        >
                            <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p>No active workspace conversations.</p>
                        </motion.div>
                    ) : (
                        conversations.map((conv, i) => {
                            const partner = conv.user1.username === user.username ? conv.user2 : conv.user1;
                            const isActive = selectedId === conv.id;

                            return (
                                <motion.div
                                    key={conv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`conversation-item-v2 ${isActive ? 'active' : ''}`}
                                    onClick={() => onSelect(conv)}
                                >
                                    <div className="avatar-wrapper">
                                        <div className="avatar-lg">
                                            {partner.profile_pic ? (
                                                <img src={partner.profile_pic} alt="" />
                                            ) : (
                                                partner.username[0].toUpperCase()
                                            )}
                                        </div>
                                        <motion.span 
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="status-dot online"
                                        />
                                    </div>
                                    <div className="conv-details">
                                        <div className="conv-header">
                                            <span className="partner-name">{partner.username}</span>
                                            <span className="last-seen">12:30 PM</span>
                                        </div>
                                        <p className="last-message">Secure workspace session active</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ChatList;
