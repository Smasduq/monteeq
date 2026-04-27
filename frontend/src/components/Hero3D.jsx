import React from 'react';
import { motion } from 'framer-motion';

const Hero3D = () => {
    return (
        <div className="css-3d-scene">
            <div className="css-3d-container">
                {/* --- HOLOGRAPHIC ENERGY FIELD --- */}
                <motion.div 
                    className="holographic-field"
                    animate={{ rotateY: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '500px',
                        height: '500px',
                        border: '0.5px solid rgba(235, 0, 0, 0.1)',
                        borderRadius: '50%',
                        marginLeft: '-250px',
                        marginTop: '-250px',
                        transformStyle: 'preserve-3d',
                        background: 'radial-gradient(circle, rgba(235, 0, 0, 0.05) 0%, transparent 70%)'
                    }}
                />

                {/* --- CYBER MONOLITH --- */}
                <motion.div 
                    className="css-3d-monolith cyber-glow-red"
                    animate={{ 
                        rotateY: [0, 360],
                        rotateX: [10, 20, 10],
                        z: [0, 50, 0]
                    }}
                    transition={{ 
                        duration: 15, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                >
                    <div className="face front" style={{ background: 'rgba(235,0,0,0.1)', border: '1px solid #eb0000' }}>
                        <div className="hud-line"></div>
                    </div>
                    <div className="face back"></div>
                    <div className="face left"></div>
                    <div className="face right"></div>
                    <div className="face top"></div>
                    <div className="face bottom"></div>
                </motion.div>

                {/* --- ORBITING HUD ELEMENTS --- */}
                {[...Array(3)].map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ rotateY: 360, rotateX: i * 30 }}
                        transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            width: '300px',
                            height: '300px',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            marginLeft: '-150px',
                            marginTop: '-150px',
                            transformStyle: 'preserve-3d'
                        }}
                    />
                ))}
            </div>

            {/* --- HYPER-SPACE PARTICLES --- */}
            <div className="css-3d-particles">
                {[...Array(50)].map((_, i) => (
                    <motion.div 
                        key={i}
                        className="css-particle"
                        initial={{ 
                            x: Math.random() * 100 + "%", 
                            y: Math.random() * 100 + "%",
                            z: Math.random() * 500,
                            opacity: 0
                        }}
                        animate={{ 
                            z: [0, 1000],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ 
                            duration: 2 + Math.random() * 3, 
                            repeat: Infinity, 
                            delay: Math.random() * 5,
                            ease: "easeIn"
                        }}
                        style={{
                            width: '2px',
                            height: '2px',
                            background: '#eb0000',
                            boxShadow: '0 0 10px #eb0000'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero3D;
