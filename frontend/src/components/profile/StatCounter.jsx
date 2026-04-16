import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const StatCounter = ({ value, duration = 1.5 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: duration,
            onUpdate: (latest) => setCount(Math.floor(latest)),
            ease: "easeOut"
        });
        return () => controls.stop();
    }, [value, duration]);

    return (
        <motion.span>
            {count.toLocaleString()}
        </motion.span>
    );
};

export default StatCounter;
