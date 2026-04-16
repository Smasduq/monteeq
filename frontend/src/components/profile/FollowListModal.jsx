import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Profile.module.css';

const FollowListModal = ({ title, users, onClose }) => {
    const navigate = useNavigate();

    const handleUserClick = (username) => {
        onClose();
        navigate(`/profile/${username}`);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modal} ${styles.glass}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button className={styles.btnIcon} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className={styles.modalContent}>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div 
                                key={user.id} 
                                className={styles.userCard}
                                onClick={() => handleUserClick(user.username)}
                            >
                                <div className={styles.userAvatar}>
                                    {user.profile_pic ? (
                                        <img src={user.profile_pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {user.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.userMeta}>
                                    <div className={styles.userName}>{user.full_name || user.username}</div>
                                    <div className={styles.userHandle}>@{user.username}</div>
                                </div>
                                <button className={styles.btnSecondary} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    View
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListModal;
