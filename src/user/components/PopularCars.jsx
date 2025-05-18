import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CarCard from './CarCard';
import api from '../../services/api';

const PopularCars = ({ cars = [], isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6">Popular Cars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cars.map(car => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default PopularCars;