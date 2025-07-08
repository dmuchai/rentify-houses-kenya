import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
      <h1 className="text-3xl font-bold mb-2">🏡 Welcome to Rentify Kenya</h1>
      <p className="text-gray-600 mb-6">Find and manage property listings with ease.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Go to Agent Dashboard
      </button>
    </main>
  );
};

export default HomePage;
