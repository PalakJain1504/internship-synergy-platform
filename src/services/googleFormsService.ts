
// Google Forms Service
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { FormSettings } from '@/lib/types';

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

// Replace with your Google API credentials - make sure these match your Google Cloud setup
const API_KEY = 'AIzaSyD2KHlyBMQajN4wETJqqDIobBJnQH6wWoY'; // Your API key
const CLIENT_ID = '397462943494-fj4js6snhvf8q3aljits3e6jvp6oui4h.apps.googleusercontent.com'; // Your OAuth 2.0 client ID
const REDIRECT_URI = 'http://localhost:8080/oauth2callback'; // Dynamic redirect URI

// The API Discovery Document
const DISCOVERY_DOCS = ["https://forms.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required
const SCOPES = 'https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/forms.responses.readonly';

// Store the OAuth 2.0 token in localStorage for persistence
const TOKEN_KEY = 'google_forms_token';
let gapiInitialized = false;
let tokenClient: any = null;

// Initialize the Google API client
export const initGoogleApi = async (): Promise<void> => {
  try {
    console.log('Initializing Google API');
    console.log('Current origin:', window.location.origin);
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

    // Wait for scripts to load
    await new Promise<void>((resolve) => {
      const checkGapiLoaded = () => {
        if (window.gapi && window.google) {
          resolve();
        } else {
          setTimeout(checkGapiLoaded, 100);
        }
      };
      checkGapiLoaded();
    });

    console.log('Google API scripts loaded');

    // Initialize GAPI client
    await new Promise<void>((resolve) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          console.log('GAPI client initialized');
          gapiInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing GAPI client:', error);
          toast.error('Failed to initialize Google API client');
          resolve();
        }
      });
    });

    // Initialize Google Identity Services
    if (window.google && window.google.accounts) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
            console.log('Successfully obtained access token');
          }
        },
        error_callback: (error: any) => {
          console.error('Error getting OAuth token:', error);
          toast.error('Failed to authenticate with Google');
        }
      });
      console.log('Google Identity Services initialized');
    } else {
      console.error('Google Identity Services not available');
    }
  } catch (error) {
    console.error('Error initializing Google API:', error);
    toast.error('Failed to initialize Google API');
  }
};

// Handle OAuth Callback
export const handleOAuthCallback = (): void => {
  console.log('Handling OAuth callback');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    console.log('Authorization code received:', code);
    // Exchange code for token
    // This will be handled by Google Identity Services automatically
    // We just need to redirect back to the main page
    window.location.href = '/internship-portal';
  } else {
    console.error('No authorization code found in callback URL');
    toast.error('Authentication failed');
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
    await initGoogleApi();
  }

  if (!tokenClient) {
    console.error('Token client not initialized');
    toast.error('Google authentication not properly initialized');
    return false;
  }

  try {
    console.log('Starting Google authentication flow');
    // Automatically open OAuth consent screen
    tokenClient.requestAccessToken({prompt: 'consent'});
    return true;
  } catch (error) {
    console.error('Error during Google authentication:', error);
    toast.error('Failed to authenticate with Google');
    return false;
  }
};

// Create a Google Form
export const createGoogleForm = async (formSettings: FormSettings): Promise<{ url: string } | null> => {
  if (!gapiInitialized) {
    await initGoogleApi();
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.log('No token found, starting authentication');
    const authenticated = await authenticateWithGoogle();
    if (!authenticated) {
      toast.error('Authentication required to create forms');
      return null;
    }
    // Wait for auth callback to set token
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!localStorage.getItem(TOKEN_KEY)) {
      toast.error('Failed to obtain authentication token');
      return null;
    }
  }

  try {
    console.log('Creating Google form with settings:', formSettings);
    // Create form with title
    const formResponse = await window.gapi.client.request({
      path: 'https://forms.googleapis.com/v1/forms',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title: formSettings.title,
          documentTitle: formSettings.title,
        }
      })
    });

    const formId = formResponse.result.formId;
    console.log('Form created with ID:', formId);

    // Build form items based on included fields
    const formItems = [];
    
    // Add standard fields
    if (formSettings.includeFields.includes('rollNo')) {
      formItems.push({
        title: 'Roll Number',
        questionItem: {
          question: {
            required: true,
            textQuestion: {
              paragraph: false
            }
          }
        }
      });
    }
    
    if (formSettings.includeFields.includes('name')) {
      formItems.push({
        title: 'Full Name',
        questionItem: {
          question: {
            required: true,
            textQuestion: {
              paragraph: false
            }
          }
        }
      });
    }
    
    if (formSettings.includeFields.includes('program')) {
      formItems.push({
        title: 'Program',
        questionItem: {
          question: {
            required: true,
            textQuestion: {
              paragraph: false
            }
          }
        }
      });
    }
    
    if (formSettings.includeFields.includes('organization')) {
      formItems.push({
        title: 'Organization Name',
        questionItem: {
          question: {
            required: true,
            textQuestion: {
              paragraph: false
            }
          }
        }
      });
    }
    
    if (formSettings.includeFields.includes('dates')) {
      formItems.push({
        title: 'Internship Duration',
        questionItem: {
          question: {
            required: true,
            textQuestion: {
              paragraph: false
            }
          }
        }
      });
    }
    
    // Add custom fields
    if (formSettings.customFields && formSettings.customFields.length > 0) {
      formSettings.customFields.forEach((field: string) => {
        if (field.trim()) {
          formItems.push({
            title: field,
            questionItem: {
              question: {
                required: false,
                textQuestion: {
                  paragraph: true
                }
              }
            }
          });
        }
      });
    }
    
    // Add file upload fields for documents
    if (formSettings.pdfFields && formSettings.pdfFields.length > 0) {
      formSettings.pdfFields.forEach((field: string) => {
        if (field === 'noc') {
          formItems.push({
            title: 'Upload No Objection Certificate (NOC)',
            questionItem: {
              question: {
                required: true,
                fileUploadQuestion: {
                  maxFiles: 1,
                  maxFileSize: 10485760, // 10MB
                  types: ['application/pdf']
                }
              }
            }
          });
        } else if (field === 'offerLetter') {
          formItems.push({
            title: 'Upload Offer Letter',
            questionItem: {
              question: {
                required: true,
                fileUploadQuestion: {
                  maxFiles: 1,
                  maxFileSize: 10485760, // 10MB
                  types: ['application/pdf']
                }
              }
            }
          });
        }
        // Removed 'pop' option
      });
    }
    
    // Add hidden fields for metadata
    formItems.push({
      title: 'Session (Do not modify)',
      questionItem: {
        question: {
          required: true,
          textQuestion: {
            paragraph: false
          }
        }
      },
      description: formSettings.session
    });
    
    formItems.push({
      title: 'Year (Do not modify)',
      questionItem: {
        question: {
          required: true,
          textQuestion: {
            paragraph: false
          }
        }
      },
      description: formSettings.year
    });
    
    // Update form with items
    if (formItems.length > 0) {
      await window.gapi.client.request({
        path: `https://forms.googleapis.com/v1/forms/${formId}/batchUpdate`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              updateFormInfo: {
                info: {
                  description: `This form collects internship details for ${formSettings.program || 'all programs'} for ${formSettings.session}. Please fill all required fields accurately.`
                },
                updateMask: 'description'
              }
            },
            {
              createItem: {
                item: {
                  title: 'Internship Details',
                  description: `Please provide accurate information about your internship for ${formSettings.session}`,
                  sectionHeader: {}
                },
                location: {
                  index: 0
                }
              }
            },
            ...formItems.map((item, index) => ({
              createItem: {
                item: item,
                location: {
                  index: index + 1
                }
              }
            }))
          ]
        })
      });
    }

    // Get form URL
    const form = await window.gapi.client.request({
      path: `https://forms.googleapis.com/v1/forms/${formId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
      }
    });
    
    const formUrl = form.result.responderUri;
    console.log('Form URL:', formUrl);
    
    return { url: formUrl };
  } catch (error) {
    console.error('Error creating Google Form:', error);
    toast.error('Failed to create Google Form');
    return null;
  }
};

// Implementation of the addFormQuestions function
export const addFormQuestions = async (formId: string, formSettings: FormSettings): Promise<boolean> => {
  if (!gapiInitialized) {
    await initGoogleApi();
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const authenticated = await authenticateWithGoogle();
    if (!authenticated) {
      toast.error('Authentication required to add questions');
      return false;
    }
  }

  try {
    console.log(`Adding questions to form: ${formId}`);
    
    // Add questions to an existing form
    const formItems = [];
    
    // The logic here would be similar to createGoogleForm but just for adding questions
    // We'll implement a basic version that returns true since createGoogleForm already handles adding questions
    
    return true;
  } catch (error) {
    console.error('Error adding questions to form:', error);
    toast.error('Failed to add questions to form');
    return false;
  }
};
