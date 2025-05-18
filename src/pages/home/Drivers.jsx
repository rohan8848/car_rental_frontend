// src/pages/home/Drivers.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const Drivers = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const handleSubmitRating = () => {
    alert(`Thanks for rating! Your rating is: ${rating}`);
  };

  return (
    <div>
      <h1>Drivers</h1>
      <p>Rate the drivers here!</p>
      {user && (
        <div>
          <p>Welcome, {user.name}. Please rate the drivers below:</p>
          <input 
            type="number" 
            value={rating} 
            onChange={handleRatingChange} 
            min="1" max="5" 
            placeholder="Rate from 1 to 5" 
          />
          <button onClick={handleSubmitRating}>Submit Rating</button>
        </div>
      )}
    </div>
  );
};

export default Drivers;
