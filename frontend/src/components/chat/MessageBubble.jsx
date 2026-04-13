import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileIcon, Download, Play, Pause, Shield } from 'lucide-react';

const MessageBubble = ({ message, isSent, decryptedContent, onDownloadFile, decryptBinary }) => {
    const [isVoicePlaying, setIsVoicePlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const audioRef = useRef(null);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handlePlayVoice = async () => {
        if (isVoicePlaying) {
            audioRef.current.pause();
            setIsVoicePlaying(false);
            return;
        }

        if (!audioUrl) {
            try {
                const response = await fetch(message.attachment_url);
                const encryptedBuffer = await response.arrayBuffer();
                const decryptedBlob = await decryptBinary(encryptedBuffer);
                const url = URL.createObjectURL(decryptedBlob);
                setAudioUrl(url);
                audioRef.current = new Audio(url);
                audioRef.current.onended = () => setIsVoicePlaying(false);
            } catch (err) {
                console.error("Failed to play voice", err);
                return;
            }
        }

        audioRef.current.play();
        setIsVoicePlaying(true);
    };

    const renderContent = () => {
        if (!decryptedContent) return <span className="deciphering">Decrypting secure message...</span>;

        switch (message.message_type) {
            case 'voice':
                return (
                    <div className="voice-message">
                        <button className="voice-play-btn" onClick={handlePlayVoice}>
                            {isVoicePlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
                        </button>
                        <div className="voice-waveform-placeholder">
                           <div className="static-waveform"></div>
                        </div>
                    </div>
                );
            case 'file':
                const metadata = message.file_metadata ? JSON.parse(message.file_metadata) : {};
                return (
                    <div className="file-attachment" onClick={() => onDownloadFile(message)}>
                        <div className="file-icon">
                            <FileIcon size={24} />
                        </div>
                        <div className="file-info">
                            <span className="file-name">{metadata.name || 'Attachment'}</span>
                            <span className="file-size">{metadata.size ? `${(metadata.size / 1024).toFixed(1)} KB` : ''}</span>
                        </div>
                        <Download size={18} className="download-icon" />
                    </div>
                );
            default:
                return <p className="text-content">{decryptedContent}</p>;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10, x: isSent ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            className={`messageBubble ${isSent ? 'sent' : 'received'}`}
        >
            <div className="bubble-content">
                {renderContent()}
            </div>
            <div className="bubble-footer">
                <span className="message-time">{formatTime(message.created_at)}</span>
                <Shield size={10} className="e2ee-tick" />
            </div>
        </motion.div>
    );
};

export default MessageBubble;
