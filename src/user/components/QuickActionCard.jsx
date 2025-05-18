import React from 'react';
import { motion } from 'framer-motion';

const QuickActionCard = ({ title, description, icon, bgColor, buttonColor, onClick }) => {
  return (
    <motion.div 
      className={`${bgColor} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button 
        onClick={onClick}
        className={`${buttonColor} text-white px-6 py-2 rounded-lg 
          hover:opacity-90 transition-all duration-300`}
      >
        Get Started
      </button>
    </motion.div>
  );
};

export default QuickActionCard;