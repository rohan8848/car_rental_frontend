import React, { useEffect } from "react";
import "aos/dist/aos.css";
import AOS from "aos";
import { Link } from "react-scroll"; // Importing Link component from react-scroll


const Hero = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: false });
  }, []);

  return (
    <div>
      {/* Hero Section */}
     
      <div className="bg-neutral-900 relative overflow-hidden" id="home">
        <div className="max-w-7xl mx-auto px-4 xl:px-0 pt-24 lg:pt-32 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
            <div>
              <h1
                className="font-semibold text-white text-5xl md:text-6xl leading-tight"
                data-aos="fade-up"
              >
                
                <span className="text-yellow-400">Car Rental:</span> Your journey starts here
              </h1>
              <p
                className="mt-5 text-neutral-400 text-lg"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Experience freedom on the road with our wide selection of vehicles designed to fit your style and budget. At DriveSmart Rentals, we make every trip memorable, providing unmatched reliability and top-notch service.
              </p>
              <div className="mt-8">
                
                {/* Scroll to Booking Section */}
                <Link
                  to="booking" // This will refer to the id of the Booking section in the main app
                  smooth={true}
                  duration={1000}
                  className="px-8 py-3 bg-yellow-400 text-black rounded-full text-xl hover:bg-yellow-500 transition cursor-pointer"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  Book Your Car
                </Link>
              </div>
            </div>
            <div className="relative" data-aos="fade-left" data-aos-delay="500">
              <img
                src="https://cdn.pixabay.com/photo/2020/11/15/12/51/car-5745558_640.jpg"
                alt="Car"
                className="w-full h-auto rounded-lg shadow-lg transform hover:scale-105 transition duration-500 ease-in-out"
              />
            </div>
          </div>
        </div>
        {/* Background SVG Wave */}
        <svg
          className="absolute -bottom-20 start-1/2 w-[1900px] transform -translate-x-1/2"
          width={2745}
          height={488}
          viewBox="0 0 2745 488"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.5 330.864C232.505 403.801 853.749 527.683 1482.69 439.719C2111.63 351.756 2585.54 434.588 2743.87 487"
            className="stroke-neutral-700/50"
            stroke="currentColor"
          />
        </svg>
      </div>
      {/* End Hero Section */}
    </div>
   
  );
};

export default Hero;
