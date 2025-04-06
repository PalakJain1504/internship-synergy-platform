
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

// Your Google API credentials
const API_KEY = 'AIzaSyD2KHlyBMQajN4wETJqqDIobBJnQH6wWoY'; 
const CLIENT_ID = '397462943494-fj4js6snhvf8q3aljits3e6jvp6oui4h.apps.googleusercontent.com';

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

    // Initialize GAPI client
    await new Promise<void>((resolve, reject) => {
      try {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: DISCOVERY_DOCS,
            });
            console.log('GAPI client initialized successfully');
            gapiInitialized = true;
            resolve();
          } catch (error) {
            console.error('Error initializing GAPI client:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Failed to load GAPI client:', error);
        reject(error);
      }
    });

    // Initialize Google Identity Services
    if (window.google && window.google.accounts) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
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
    } else {
      console.error('Google Identity Services not available');
      throw new Error('Google Identity Services not available');
    }
  } catch (error) {
    console.error('Error initializing Google API:', error);
    toast.error('Failed to initialize Google API: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Handle OAuth Callback
export const handleOAuthCallback = (): void => {
  console.log('Handling OAuth callback');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    console.log('Authorization code received');
    // Exchange code for token
    // This will be handled by Google Identity Services automatically
    // We just need to redirect back to the main page
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
    // Automatically open OAuth consent screen
    tokenClient.requestAccessToken({prompt: 'consent'});
    // We don't get a return value here since it opens a popup
    // The success/failure will be handled by the callback
    return true;
  } catch (error) {
    console.error('Error during Google authentication:', error);
    toast.error('Failed to authenticate with Google: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }
};

// Implementation of the addFormQuestions function for the FormCreator component
export const addFormQuestions = async (formId: string, formSettings: FormSettings): Promise<boolean> => {
  if (!gapiInitialized) {
    try {
      await initGoogleApi();
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      toast.error('Failed to initialize Google API for adding questions');
      return false;
    }
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    try {
      const authenticated = await authenticateWithGoogle();
      if (!authenticated) {
        toast.error('Authentication required to add questions');
        return false;
      }
      // Wait for auth callback to set token
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!localStorage.getItem(TOKEN_KEY)) {
        toast.error('Failed to obtain authentication token');
        return false;
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed');
      return false;
    }
  }

  try {
    console.log(`Adding questions to form: ${formId}`);
    
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
    
    // Add the request to update the form
    await window.gapi.client.request({
      path: `https://forms.googleapis.com/v1/forms/${formId}/batchUpdate`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: formItems.map((item, index) => ({
          createItem: {
            item: item,
            location: {
              index: index + 1
            }
          }
        }))
      })
    });
    
    return true;
  } catch (error) {
    console.error('Error adding questions to form:', error);
    toast.error('Failed to add questions to form');
    return false;
  }
};

// Create a Google Form
export const createGoogleForm = async (formSettings: FormSettings): Promise<{ url: string } | null> => {
  console.log('Starting to create Google Form');
  
  if (!gapiInitialized) {
    try {
      await initGoogleApi();
    } catch (error) {
      console.error('Failed to initialize Google API during form creation:', error);
      toast.error('Failed to initialize Google API. Please check console for details.');
      return null;
    }
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.log('No token found, starting authentication');
    try {
      const authenticated = await authenticateWithGoogle();
      if (!authenticated) {
        toast.error('Authentication required to create forms');
        return null;
      }
      // Wait for auth callback to set token
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!localStorage.getItem(TOKEN_KEY)) {
        toast.error('Failed to obtain authentication token. Check console for details.');
        return null;
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed. Please check console for details.');
      return null;
    }
  }

  try {
    console.log('Creating Google form with settings:', formSettings);
    console.log('Using token:', localStorage.getItem(TOKEN_KEY)?.substring(0, 10) + '...');
    
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
    
    if (formSettings.includeFields.includes('session')) {
      formItems.push({
        title: 'Session',
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
    
    if (formSettings.includeFields.includes('year')) {
      formItems.push({
        title: 'Year',
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
    
    if (formSettings.includeFields.includes('semester')) {
      formItems.push({
        title: 'Semester',
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
        } else if (field === 'pop') {
          formItems.push({
            title: 'Upload Proof of Participation',
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
    console.error('Error details:', JSON.stringify(error, null, 2));
    toast.error('Failed to create Google Form. Please check console for details.');
    return null;
  }
};
