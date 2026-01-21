import { motion } from 'framer-motion';
import DigitalLoomBackground from './DigitalLoomBackground';

const LandingPage = ({ onEnter }) => {
    return (
        <DigitalLoomBackground
            backgroundColor="#000000"
            threadColor="rgba(255, 255, 255, 0.2)"
            threadCount={60}
        >
            <div className="landing-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="landing-badge">
                        <span>Global News Explorer</span>
                    </div>
                </motion.div>

                <motion.h1
                    className="landing-title"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
                >
                    The Pulse of <br /> the Planet
                </motion.h1>

                <motion.p
                    className="landing-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    Explore live news from every corner of the world through an interactive, digital experience.
                </motion.p>

                <motion.div
                    className="landing-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                >
                    <button className="landing-button" onClick={onEnter}>
                        Enter World
                    </button>
                </motion.div>
            </div>
        </DigitalLoomBackground>
    );
};

export default LandingPage;
