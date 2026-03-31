import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, Layout, PlusCircle } from 'lucide-react';

const BottomNav = () => {
    return (
        <nav className="bottom-nav glass">
            <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Explore</span>
            </NavLink>
            <NavLink to="/flash" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Zap size={24} />
                <span>Flash</span>
            </NavLink>
            <NavLink to="/posts" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Layout size={24} />
                <span>Feed</span>
            </NavLink>
            <NavLink to="/upload" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} style={{
                color: 'var(--accent-primary)'
            }}>
                <PlusCircle size={24} strokeWidth={2.5} />
                <span style={{ fontWeight: 'bold' }}>Add</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
