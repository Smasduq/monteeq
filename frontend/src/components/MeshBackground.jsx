import React from 'react';
import { motion } from 'framer-motion';

const MeshBackground = () => {
    return (
        <div className="mesh-bg-container">
            {/* Pulsing Red Blobs */}
            <motion.div 
                className="mesh-blob red-1"
                animate={{ 
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.2, 0.8, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="mesh-blob red-2"
                animate={{ 
                    x: [0, -150, 100, 0],
                    y: [0, 100, -50, 0],
                    scale: [1, 0.8, 1.2, 1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Static Noise Overlay */}
            <div className="mesh-noise" />
        </div>
    );
};

export default MeshBackground;
