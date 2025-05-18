
import React, { useEffect } from "react";
import "aos/dist/aos.css";
import AOS from "aos";

const About = () => {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
   <section id="about">
     <div className="bg-neutral-800 text-white py-24">
      <div className="max-w-5xl mx-auto px-4 xl:px-0">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold"
            data-aos="fade-up"
          >
            About Us
          </h2>
          <p
            className="mt-4 text-neutral-400 text-lg"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            DriveSmart Rentals is dedicated to delivering an exceptional car rental experience. With a focus on customer satisfaction, we provide high-quality vehicles, unparalleled service, and unbeatable value.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div
            data-aos="fade-right"
            data-aos-delay="200"
          >
            <img
              src="https://picsum.photos/200"
              alt="About Us"
              className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div
            data-aos="fade-left"
            data-aos-delay="300"
          >
            <h3 className="text-3xl font-semibold mb-4">
              Why Choose Us?
            </h3>
            <ul className="text-neutral-400 space-y-3">
              <li className="flex items-center">
                <span className="text-yellow-500 text-xl mr-3">✓</span>
                Wide selection of vehicles to suit your needs.
              </li>
              <li className="flex items-center">
                <span className="text-yellow-500 text-xl mr-3">✓</span>
                Affordable pricing with no hidden costs.
              </li>
              <li className="flex items-center">
                <span className="text-yellow-500 text-xl mr-3">✓</span>
                Reliable and well-maintained cars.
              </li>
              <li className="flex items-center">
                <span className="text-yellow-500 text-xl mr-3">✓</span>
                24/7 customer support for your peace of mind.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  
   </section>
  );
};

export default About;
