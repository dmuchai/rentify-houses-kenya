import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">Connecting you to your next home in Kenya.</p>
        <div className="mt-4 space-x-4">
          <Link to="/privacy-policy" className="hover:text-green-400">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-green-400">Terms of Service</Link>
          <Link to="/contact-us" className="hover:text-green-400">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
