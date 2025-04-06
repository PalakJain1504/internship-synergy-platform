
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { FormSettings } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Add TypeScript declarations for Google API
declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

// Token storage key
const TOKEN_KEY = 'google_forms_token';
let gapiInitialized = false;
let tokenClient: any = null;

// Initialize the Google API client
export const initGoogleApi = async (): Promise<void> => {
  try {
    console.log('Initializing Google API with Supabase Edge Function');
    
    // Get the current window URL for dynamic redirect
    const currentOrigin = window.location.origin;
    const REDIRECT_URI = `${currentOrigin}/oauth2callback`; 
    console.log('Using redirect URI:', REDIRECT_URI);
    
    // Check if script is already loaded
    if (!document.getElementById('gapi-script')) {
      // Load the Google API client script
      const script1 = document.createElement('script');
      script1.id = 'gapi-script';
      script1.src = 'https://apis.google.com/js/api.js';
      script1.async = true;
      script1.defer = true;
      document.body.appendChild(script1);
    }

    if (!document.getElementById('gsi-script')) {
      // Load the Google Identity Services script
      const script2 = document.createElement('script');
      script2.id = 'gsi-script';
      script2.src = 'https://accounts.google.com/gsi/client';
      script2.async = true;
      script2.defer = true;
      document.body.appendChild(script2);
    }

    // Wait for scripts to load with a timeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for Google API scripts to load'));
      }, 10000); // 10 second timeout
      
      const checkGapiLoaded = () => {
        if (window.gapi && window.google && window.google.accounts) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkGapiLoaded, 100);
        }
      };
      checkGapiLoaded();
    });

    console.log('Google API scripts loaded');

    // Set up tokenClient using Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('google-forms-integration', {
        body: { action: 'setup' }
      });
      
      if (error) throw new Error(error.message);
      
      console.log('Google Forms integration setup response:', data);
      
      if (window.google && window.google.accounts) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: "973465958657-sqg9gqml2u004qfb2vgvl18f42nk8kqr.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/forms.responses.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
          prompt: 'consent',
          redirect_uri: REDIRECT_URI,
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
              console.log('Successfully obtained access token');
            }
          },
          error_callback: (error: any) => {
            console.error('Error getting OAuth token:', error);
            toast.error('Failed to authenticate with Google: ' + (error.message || 'Unknown error'));
          }
        });
        console.log('Google Identity Services initialized');
        gapiInitialized = true;
      } else {
        console.error('Google Identity Services not available');
        throw new Error('Google Identity Services not available');
      }
    } catch (error) {
      console.error('Error setting up Google Forms integration:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error initializing Google API:', error);
    toast.error('Failed to initialize Google API: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Handle OAuth Callback
export const handleOAuthCallback = async (): Promise<void> => {
  console.log('Handling OAuth callback');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    console.log('Authorization code received, exchanging for token');
    
    try {
      const { data, error } = await supabase.functions.invoke('google-forms-integration', {
        body: { 
          action: 'exchangeCode',
          code: code
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data && data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        console.log('Successfully exchanged code for access token');
        toast.success('Google authentication successful!');
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      toast.error('Failed to exchange authorization code for token');
    }
    
    // Redirect back to the internship portal
    window.location.href = '/internship-portal';
  } else {
    console.error('No authorization code found in callback URL');
    toast.error('Authentication failed: No authorization code received');
    window.location.href = '/internship-portal';
  }
};

// Check if user is authenticated with Google
export const isGoogleAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

// Authenticate user with Google
export const authenticateWithGoogle = async (): Promise<boolean> => {
  if (!gapiInitialized) {
    try {
      await initGoogleApi();
    } catch (error) {
      console.error('Failed to initialize Google API during authentication:', error);
      toast.error('Failed to initialize Google API for authentication');
      return false;
    }
  }

  if (!tokenClient) {
    console.error('Token client not initialized');
    toast.error('Google authentication not properly initialized');
    return false;
  }

  try {
    console.log('Starting Google authentication flow');
    // Get auth URL from edge function
    const { data, error } = await supabase.functions.invoke('google-forms-integration', {
      body: { action: 'getAuthUrl' }
    });
    
    if (error) throw new Error(error.message);
    
    if (data && data.authUrl) {
      // Redirect to Google's OAuth page
      window.location.href = data.authUrl;
      return true;
    } else {
      throw new Error('Failed to get authentication URL');
    }
  } catch (error) {
    console.error('Error during Google authentication:', error);
    toast.error('Failed to authenticate with Google: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }
};

// Create a Google Form
export const createGoogleForm = async (formSettings: FormSettings): Promise<{ url: string } | null> => {
  console.log('Starting to create Google Form');
  
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.log('No token found, starting authentication');
    try {
      const authenticated = await authenticateWithGoogle();
      if (!authenticated) {
        toast.error('Authentication required to create forms');
        return null;
      }
      // We will be redirected, so return null here
      return null;
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed');
      return null;
    }
  }

  try {
    console.log('Creating Google form with settings:', formSettings);
    
    // Build form fields based on included fields
    const fields = [];
    
    // Add standard fields
    if (formSettings.includeFields.includes('rollNo')) {
      fields.push({
        title: 'Roll Number',
        required: true,
        paragraph: false
      });
    }
    
    if (formSettings.includeFields.includes('name')) {
      fields.push({
        title: 'Full Name',
        required: true,
        paragraph: false
      });
    }
    
    if (formSettings.includeFields.includes('program')) {
      fields.push({
        title: 'Program',
        required: true,
        paragraph: false
      });
    }
    
    if (formSettings.includeFields.includes('organization')) {
      fields.push({
        title: 'Organization Name',
        required: true,
        paragraph: false
      });
    }
    
    if (formSettings.includeFields.includes('dates')) {
      fields.push({
        title: 'Internship Duration',
        required: true,
        paragraph: false
      });
    }
    
    if (formSettings.includeFields.includes('session')) {
      fields.push({
        title: 'Session',
        required: true,
        paragraph: false,
        description: formSettings.session
      });
    }
    
    if (formSettings.includeFields.includes('year')) {
      fields.push({
        title: 'Year',
        required: true,
        paragraph: false,
        description: formSettings.year
      });
    }
    
    if (formSettings.includeFields.includes('semester')) {
      fields.push({
        title: 'Semester',
        required: true,
        paragraph: false,
        description: formSettings.semester
      });
    }
    
    // Add custom fields
    if (formSettings.customFields && formSettings.customFields.length > 0) {
      formSettings.customFields.forEach((field: string) => {
        if (field.trim()) {
          fields.push({
            title: field,
            required: false,
            paragraph: true
          });
        }
      });
    }
    
    // Create the form via edge function
    const { data, error } = await supabase.functions.invoke('google-forms-integration', {
      body: { 
        action: 'createForm',
        access_token: token,
        title: formSettings.title,
        description: `Internship form for ${formSettings.program || 'all programs'} - ${formSettings.session}`,
        fields: fields
      }
    });
    
    if (error) throw new Error(error.message);
    
    if (!data || !data.responderUri) {
      throw new Error('Failed to get form URL');
    }
    
    toast.success('Google Form created successfully!');
    console.log('Form created:', data);
    
    return { url: data.responderUri };
  } catch (error) {
    console.error('Error creating Google Form:', error);
    toast.error('Failed to create Google Form: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return null;
  }
};

// Implementation of the addFormQuestions function
export const addFormQuestions = async (formId: string, formSettings: FormSettings): Promise<boolean> => {
  // This function is now handled within createGoogleForm
  console.log('addFormQuestions is now handled within createGoogleForm');
  return true;
};
