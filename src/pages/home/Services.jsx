import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in ms
      easing: "ease-in-out", // Easing function
      once: true, // Whether animation should happen only once
    });
  }, []);

  const servicesData = [
    {
      id: 1,
      title: "Luxury Cars",
      description: "Experience the pinnacle of comfort and style.",
      image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    },
    {
      id: 2,
      title: "Economy Cars",
      description: "Affordable rides for everyday travel needs.",
      image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    },
    {
      id: 3,
      title: "SUV Rentals",
      description: "Spacious SUVs for family trips and adventures.",
      image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    },
    {
      id: 4,
      title: "Corporate Cars",
      description: "Professional and elegant vehicles for business.",
      image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-28" id="services">
      <div className="max-w-7xl mx-auto px-4 xl:px-0">
        <h2
          className="text-4xl font-extrabold text-center mb-12 text-yellow-400"
          data-aos="fade-up"
        >
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesData.map((service, index) => (
            <div
              key={service.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group relative bg-neutral-800 rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-56 object-cover transition duration-300 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 via-transparent to-transparent opacity-0 group-hover:opacity-70 transition duration-300"></div>
              <div className="p-6 absolute bottom-0 w-full text-center">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  {service.title}
                </h3>
                <p className="text-neutral-300">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
