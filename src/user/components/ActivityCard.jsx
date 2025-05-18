import React from 'react';
import { motion } from 'framer-motion';

const ActivityCard = ({ activity }) => {
  return (
    <motion.div 
      className="bg-white p-4 rounded-lg shadow mb-3"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${activity.iconBg}`}>
          {activity.icon}
        </div>
        <div>
          <h4 className="font-medium">{activity.title}</h4>
          <p className="text-sm text-gray-500">{activity.time}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;