
import { supabase } from '@/integrations/supabase/client';
import { FormSettings } from '@/lib/types';

// Start OAuth flow with Google
export const initiateGoogleAuth = async (formSettings: FormSettings): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('google-forms-integration', {
      body: { action: 'init-oauth', settings: formSettings }
    });

    if (error) {
      console.error('Error initiating Google OAuth:', error);
      throw new Error(error.message);
    }

    if (!data?.authUrl) {
      throw new Error('No auth URL was returned');
    }

    // Store form settings temporarily in sessionStorage
    sessionStorage.setItem('pendingFormSettings', JSON.stringify(formSettings));
    
    return data.authUrl;
  } catch (error) {
    console.error('Error starting OAuth flow:', error);
    throw error;
  }
};

// Handle OAuth callback from Google
export const handleOAuthCallback = async (): Promise<{ formUrl: string; formId: string }> => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const formUrl = urlParams.get('formUrl');
    const formId = urlParams.get('formId');
    
    if (!formUrl || !formId) {
      throw new Error('Form URL or ID not found in callback');
    }
    
    // Clear the temporary form settings from sessionStorage
    sessionStorage.removeItem('pendingFormSettings');
    
    return { formUrl, formId };
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    throw error;
  }
};

// Get saved form settings (if any)
export const getPendingFormSettings = (): FormSettings | null => {
  const savedSettings = sessionStorage.getItem('pendingFormSettings');
  return savedSettings ? JSON.parse(savedSettings) : null;
};

// Simulate form response
export const simulateFormResponse = async (formId: string, data: any): Promise<boolean> => {
  try {
    // This is a mock function for testing - in a production app,
    // you would typically handle form responses through a webhook
    console.log(`Simulating form response for form ${formId}:`, data);
    
    // Here you would typically store the response in your database
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error simulating form response:', error);
    throw error;
  }
};
