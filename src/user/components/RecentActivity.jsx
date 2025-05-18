import React from 'react';
import { motion } from 'framer-motion';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'booking',
      title: 'Booked Tesla Model 3',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'return',
      title: 'Returned BMW X5',
      time: 'Yesterday',
      status: 'completed'
    }
  ];

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50"
            whileHover={{ x: 5 }}
          >
            <div className="flex-1">
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {activity.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;