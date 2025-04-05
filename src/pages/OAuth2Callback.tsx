
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '@/services/googleFormsService';
import { Loader2 } from 'lucide-react';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    try {
      // Process the OAuth callback
      handleOAuthCallback();
      setMessage('Authentication successful! Redirecting...');
      
      // Redirect after a short delay to allow the user to see the success message
      const timer = setTimeout(() => {
        navigate('/home');
      }, 2000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      setMessage('Authentication failed. Please try again.');
      
      // Redirect after a short delay
      const timer = setTimeout(() => {
        navigate('/home');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-4" />
        <h1 className="text-xl font-semibold mb-2">Google Authentication</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default OAuth2Callback;
