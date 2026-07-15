import { useEffect } from 'react';
import { motion } from 'framer-motion';

// Enter: elegant fade + rise (0.7s)
// Exit:  fast fade only (0.15s) — prevents the scroll-to-top flash on the old page
const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15, ease: 'easeIn' },
    },
};

const PageTransition = ({ children }) => {
    // Every page that mounts resets scroll — final safety net
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
