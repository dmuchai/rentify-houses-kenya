import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">Connecting you to your next home in Kenya.</p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:text-green-400">Privacy Policy</a>
          <a href="#" className="hover:text-green-400">Terms of Service</a>
          <a href="#" className="hover:text-green-400">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
