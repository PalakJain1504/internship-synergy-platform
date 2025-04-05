
import { useEffect } from 'react';
import { handleOAuthCallback } from '@/services/googleFormsService';

const OAuth2Callback = () => {
  useEffect(() => {
    // Process the OAuth callback when the component mounts
    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p>Please wait while we complete the authentication process.</p>
        <div className="mt-4 w-16 h-1 bg-brand-blue/20 mx-auto rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default OAuth2Callback;
