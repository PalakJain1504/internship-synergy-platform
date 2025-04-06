
import { useEffect, useState } from 'react';
import { handleOAuthCallback } from '@/services/googleFormsService';
import { useNavigate } from 'react-router-dom';

const OAuth2Callback = () => {
  const [status, setStatus] = useState('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    // Process the OAuth callback when the component mounts
    const processCallback = async () => {
      try {
        setStatus('Exchanging authorization code for token...');
        await handleOAuthCallback();
        setStatus('Authentication successful! Redirecting...');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/internship-portal');
        }, 2000);
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('Authentication failed. Redirecting back...');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/internship-portal');
        }, 2000);
      }
    };
    
    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Google Authentication</h1>
        <p className="mb-6">{status}</p>
        <div className="mt-4 w-16 h-1 bg-brand-blue/20 mx-auto rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default OAuth2Callback;
