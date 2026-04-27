import React from 'react';
import { motion } from 'framer-motion';

const Section3D = ({ color = "#eb0000" }) => {
    return (
        <div className="css-3d-section-wrap">
            <div className="css-3d-scene-mini">
                {/* Floating Glass Layers */}
                <motion.div 
                    className="glass-layer-base"
                    animate={{ 
                        rotateY: [-10, 10],
                        rotateX: [5, -5],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                >
                    <div className="glass-inner" style={{ borderColor: `${color}33` }}>
                        <motion.div 
                            className="glass-glow" 
                            style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Orbiting Ring */}
                <motion.div 
                    className="glass-ring"
                    style={{ border: `1px solid ${color}44` }}
                    animate={{ rotateZ: 360, rotateX: 60 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Floating Core */}
                <motion.div 
                    className="glass-core"
                    style={{ background: color }}
                    animate={{ 
                        y: [-20, 20],
                        scale: [1, 1.1, 1],
                        boxShadow: [`0 0 20px ${color}44`, `0 0 50px ${color}88`, `0 0 20px ${color}44`]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                />
            </div>
        </div>
    );
};

export default Section3D;
