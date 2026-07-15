import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reveal-on-scroll wrapper.
 *
 * Animates: opacity 0→1, scale 0.96→1, blur(8px)→0, plus a small directional offset.
 * Effects compound: things bloom into focus rather than just fading in.
 */
export default function ScrollReveal({
    children,
    delay = 0,
    direction = 'up',
    className = '',
}) {
    /** @type {Record<string, { x: number, y: number }>} */
    const directionMap = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 },
        none: { y: 0, x: 0 },
    };

    const offset = directionMap[direction] || directionMap.up;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)', ...offset }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)', x: 0, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
                duration: 1.2,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}