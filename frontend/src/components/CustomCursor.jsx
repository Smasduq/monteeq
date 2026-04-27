import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

const CustomCursor = () => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 30, stiffness: 120 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX + 20); // Offset to the side
            cursorY.set(e.clientY + 20);
            setCoords({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className="cyber-cursor-follower"
            style={{
                translateX: cursorXSpring,
                translateY: cursorYSpring,
            }}
        >
            <div className="cursor-bracket-top"></div>
            <div className="cursor-data-box">
                <span className="cursor-id">MTQ_TRK</span>
                <span className="cursor-coords">{coords.x} / {coords.y}</span>
            </div>
            <div className="cursor-bracket-bottom"></div>
        </motion.div>
    );
};

export default CustomCursor;
