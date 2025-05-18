import React, { useState } from 'react';
import 'aos/dist/aos.css'; // AOS Animation Styles
import AOS from 'aos';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';

AOS.init();

const FixedCar = () => {
  const [city, setCity] = useState('Kathmandu');
  const [area, setArea] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');

  const areasInKathmandu = [
    'Thamel',
    'Patan',
    'Bhaktapur',
    'Baneshwor',
    'Lalitpur',
    'Durbar Square',
    'Sundhara',
    'Chabahil',
    'Bouddha',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Booking Details:\nCity: ${city}\nArea: ${area}\nStart Date: ${startDate}\nEnd Date: ${endDate}\nStart Time: ${startTime}`);
  };

  return (
    <div
      className="bg-neutral-900 text-white p-4  shadow-lg max-w-full mx-auto index-1"
      style={{ minHeight: '150px' }}
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <h1 className="text-xl font-bold text-center mb-4">Book Your Vehicle</h1>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-center gap-4">
        {/* City Selection */}
        <div className="flex items-center gap-2 flex-1">
          <FaMapMarkerAlt className="text-blue-500" />
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Kathmandu">Kathmandu</option>
          </select>
        </div>

        {/* Area Selection */}
        <div className="flex items-center gap-2 flex-1">
          <FaMapMarkerAlt className="text-blue-500" />
          <select
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an area
            </option>
            {areasInKathmandu.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="flex items-center gap-2 flex-1">
          <FaCalendarAlt className="text-blue-500" />
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2 flex-1">
          <FaCalendarAlt className="text-blue-500" />
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Start Time */}
        <div className="flex items-center gap-2 flex-1">
          <FaClock className="text-blue-500" />
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex-1">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default FixedCar;
