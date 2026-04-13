import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCrypto } from '../hooks/useCrypto';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { 
    getConversations, 
    getChatMessages, 
    sendChatMessage, 
    getUserPublicKey, 
    uploadPublicKey,
    uploadChatAttachment,
    searchUnified,
    linkGoogleAccount
} from '../api';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { useGoogleLogin } from '@react-oauth/google';
import './Chat.css';

const Chat = () => {
    const { user, token, setUser } = useAuth();
    const { 
        generateKeyPair, 
        encryptMessage, 
        decryptMessage, 
        encryptBinary, 
        decryptBinary,
        exportPrivateKey,
        importPrivateKey,
        hasLocalKey 
    } = useCrypto();

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [decryptedMessages, setDecryptedMessages] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isSetup, setIsSetup] = useState(false);
    const [isInitialSync, setIsInitialSync] = useState(true);

    const drive = useGoogleDrive(async (driveToken) => {
        // Callback when drive authenticates
        await performDriveSync(driveToken);
    });

    const handleGoogleLink = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const linkRes = await linkGoogleAccount(tokenResponse.access_token, token);
                if (linkRes.google_id) {
                    setUser(linkRes);
                    // drive hook will automatically have access to updated user
                    // We might need to manually trigger sync if it doesn't happen
                }
            } catch (err) {
                console.error("Link failed", err);
            }
        },
        scope: 'https://www.googleapis.com/auth/drive.file email profile'
    });

    const performDriveSync = useCallback(async (driveToken) => {
        if (!user.google_id) return;
        const backup = await drive.loadBackup();
        if (backup && backup.wrappedPrivateKey) {
            console.log("Found backup on Google Drive, syncing keys...");
            await importPrivateKey(backup.wrappedPrivateKey);
            setIsSetup(true);
        }
    }, [user.google_id, drive, importPrivateKey]);

    useEffect(() => {
        const checkKey = async () => {
            const hasKey = await hasLocalKey();
            if (hasKey) {
                setIsSetup(true);
            } else if (user.google_id && drive.isAuthenticated) {
                await performDriveSync();
            }
            setIsInitialSync(false);
        };
        checkKey();
    }, [hasLocalKey, user.google_id, drive.isAuthenticated, performDriveSync]);

    const fetchConversations = useCallback(async () => {
        try {
            const data = await getConversations(token);
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    }, [token]);

    useEffect(() => {
        if (token && isSetup) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 10000);
            return () => clearInterval(interval);
        }
    }, [token, isSetup, fetchConversations]);

    const decryptAll = useCallback(async (msgs) => {
        for (const msg of msgs) {
            if (!decryptedMessages[msg.id]) {
                try {
                    const wrappedKey = String(msg.sender_id) === String(user.id) ? msg.sender_key : msg.recipient_key;
                    if (msg.message_type === 'text') {
                        const decrypted = await decryptMessage(msg.encrypted_content, msg.iv, wrappedKey);
                        setDecryptedMessages(prev => ({ ...prev, [msg.id]: decrypted }));
                    } else {
                        // For files/voice, we just return a placeholder or handle on-demand
                        setDecryptedMessages(prev => ({ ...prev, [msg.id]: `[${msg.message_type.toUpperCase()}]` }));
                    }
                } catch (e) {
                    setDecryptedMessages(prev => ({ ...prev, [msg.id]: '[Secure Message]' }));
                }
            }
        }
    }, [user.id, decryptedMessages, decryptMessage]);

    const fetchMessages = useCallback(async (convId) => {
        try {
            const data = await getChatMessages(convId, token);
            setMessages(data);
            decryptAll(data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    }, [token, decryptAll]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            const interval = setInterval(() => fetchMessages(selectedConv.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedConv, fetchMessages]);

    const handleSetupKeys = async () => {
        const pubKey = await generateKeyPair();
        await uploadPublicKey(pubKey, token);
        setIsSetup(true);
        
        // If Google user, backup the private key immediately
        if (user.google_id && drive.isAuthenticated) {
            const privKeyB64 = await exportPrivateKey();
            await drive.saveBackup({ wrappedPrivateKey: privKeyB64, syncedAt: new Date().toISOString() });
        }
    };

    const handleSendMessage = async (text) => {
        if (!selectedConv) return;
        const recipient = selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1;
        
        try {
            const recipientKeys = await getUserPublicKey(recipient.username, token);
            const encrypted = await encryptMessage(text, recipientKeys.public_key, user.public_key);
            
            await sendChatMessage({
                ...encrypted,
                recipient_username: recipient.username,
                message_type: 'text'
            }, token);
            
            fetchMessages(selectedConv.id);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleSendVoice = async (blob) => {
        if (!selectedConv) return;
        const recipient = selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1;
        
        try {
            // 1. Upload encrypted attachment
            const arrayBuffer = await blob.arrayBuffer();
            const recipientKeys = await getUserPublicKey(recipient.username, token);
            const encrypted = await encryptBinary(arrayBuffer, recipientKeys.public_key, user.public_key);
            
            // 2. Upload file
            const encryptedBlob = new Blob([base64ToArrayBuffer(encrypted.encrypted_content)], { type: 'application/octet-stream' });
            const uploadRes = await uploadChatAttachment(encryptedBlob, token);
            
            // 3. Send message
            await sendChatMessage({
                ...encrypted,
                encrypted_content: 'ENCRYPTED_VOICE', // Real content is in the file
                recipient_username: recipient.username,
                message_type: 'voice',
                attachment_url: uploadRes.url,
                file_metadata: JSON.stringify({ size: blob.size, type: blob.type })
            }, token);
            
            fetchMessages(selectedConv.id);
        } catch (err) {
            console.error("Voice send failed", err);
        }
    };

    const handleUploadFile = async (file) => {
        if (!selectedConv || !file) return;
        const recipient = selectedConv.user1.username === user.username ? selectedConv.user2 : selectedConv.user1;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const recipientKeys = await getUserPublicKey(recipient.username, token);
            const encrypted = await encryptBinary(arrayBuffer, recipientKeys.public_key, user.public_key);
            
            const encryptedBlob = new Blob([base64ToArrayBuffer(encrypted.encrypted_content)], { type: 'application/octet-stream' });
            const uploadRes = await uploadChatAttachment(encryptedBlob, token);
            
            await sendChatMessage({
                ...encrypted,
                encrypted_content: 'ENCRYPTED_FILE',
                recipient_username: recipient.username,
                message_type: 'file',
                attachment_url: uploadRes.url,
                file_metadata: JSON.stringify({ name: file.name, size: file.size, type: file.type })
            }, token);
            
            fetchMessages(selectedConv.id);
        } catch (err) {
            console.error("File upload failed", err);
        }
    };

    const handleDownloadFile = async (msg) => {
        try {
            const response = await fetch(msg.attachment_url);
            const encryptedBuffer = await response.arrayBuffer();
            const encryptedB64 = arrayBufferToBase64(encryptedBuffer);
            
            const wrappedKey = String(msg.sender_id) === String(user.id) ? msg.sender_key : msg.recipient_key;
            const decryptedBuffer = await decryptBinary(encryptedB64, msg.iv, wrappedKey);
            
            const metadata = JSON.parse(msg.file_metadata);
            const blob = new Blob([decryptedBuffer], { type: metadata.type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = metadata.name || 'download';
            a.click();
        } catch (err) {
            console.error("File download/decrypt failed", err);
        }
    };

    // Helper functions for base64 (already in useCrypto but re-declared here for handle logic if needed or just use useCrypto ones)
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    if (isInitialSync) return <div className="chatWorkspace-loading">Initializing Elite Workspace...</div>;

    if (!isSetup) {
        return (
            <div className="chat-setup-container">
                <div className="glass setup-card">
                    <h2>E2E Encryption Required</h2>
                    <p>To access the Monteeq workspace, you must generate your unique client-side encryption key.</p>
                    <button className="primary-btn" onClick={handleSetupKeys}>Generate Workspace Key</button>
                    {user.google_id && !drive.isAuthenticated && (
                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Logged in with Google? Your keys will be automatically synced.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="chatWorkspace">
            <ChatList 
                conversations={conversations} 
                selectedId={selectedConv?.id}
                onSelect={(conv) => setSelectedConv(conv)}
                user={user}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
            />
            <ChatWindow 
                selectedConv={selectedConv}
                messages={messages}
                decryptedMessages={decryptedMessages}
                user={user}
                onSendMessage={handleSendMessage}
                onSendVoice={handleSendVoice}
                onUploadFile={handleUploadFile}
                onDownloadFile={handleDownloadFile}
            />
            <div className="chatInfo">
                {selectedConv && (
                   <div className="info-panel-content">
                        <h3>Session Security</h3>
                        <p>Fully End-to-End Encrypted</p>
                        <div className="drive-status">
                            {user.google_id && (
                                <>
                                    <span>Sync Status:</span>
                                    {drive.isSyncing ? 'Syncing...' : (drive.isAuthenticated ? 'Protected by Google' : 'Cloud Backup Pending')}
                                    {!user.google_id ? (
                                        <button className="primary-btn-mini" onClick={() => handleGoogleLink()}>Link Google</button>
                                    ) : (!drive.isAuthenticated && (
                                        <button className="primary-btn-mini" onClick={() => drive.login()}>Enable Drive Sync</button>
                                    ))}
                                </>
                            )}
                        </div>
                   </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
