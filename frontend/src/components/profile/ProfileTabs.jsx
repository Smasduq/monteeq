import React from 'react';
import styles from '../../pages/Profile.module.css';

const ProfileTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'videos', label: 'Videos' },
        { id: 'flash', label: 'Flash' },
        { id: 'posts', label: 'Posts' },
        { id: 'likes', label: 'Likes' }
    ];

    return (
        <nav className={styles.tabNav}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                    {activeTab === tab.id && <div className={styles.tabIndicator} />}
                </button>
            ))}
        </nav>
    );
};

export default ProfileTabs;
