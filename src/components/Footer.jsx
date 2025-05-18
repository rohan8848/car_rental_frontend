import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  const socialMediaLinks = [
    { href: 'https://twitter.com', icon: <FaTwitter /> },
    { href: 'https://facebook.com', icon: <FaFacebook /> },
    { href: 'https://instagram.com', icon: <FaInstagram /> },
    { href: 'https://linkedin.com', icon: <FaLinkedin /> },
  ];

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="1000"
      className="bg-gray-900 text-white py-12"
    >
      {/* Social Media Links */}
      <div className="flex flex-wrap justify-center mb-4">
        {socialMediaLinks.map((link, index) => (
          <a
            key={index}
            rel="noopener noreferrer"
            href={link.href}
            target="_blank"
            className="text-lg text-gray-600 hover:text-white transition duration-300 ease-in-out mx-2"
          >
            {link.icon}
          </a>
        ))}
      </div>


      {/* Footer Content */}
      <div className="flex flex-wrap items-center md:justify-between justify-center">
        <div className="w-full md:w-4/12 px-4 mx-auto text-center">
          <div className="text-sm text-gray-600 py-1">
            <span>2025 &copy; Car Rental. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
