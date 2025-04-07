
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

// Constants for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gjhwggkmrqwskexdnmif.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Google API settings
const GOOGLE_CLIENT_ID = '973465958657-sqg9gqml2u004qfb2vgvl18f42nk8kqr.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_API_KEY = 'AIzaSyBvoaFgVJkg1XyaLaFGsVaXFGlScCSXoJo';
const REDIRECT_URI = `${supabaseUrl}/functions/v1/google-forms-integration/oauth-callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/forms',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

interface FormSettings {
  portalType: 'project' | 'internship';
  title: string;
  session: string;
  year: string;
  semester: string;
  program?: string;
  minStudents?: number;
  maxStudents?: number;
  includeFields: string[];
  pdfFields: string[];
  customFields: string[];
}

// Helper to create a proper response with CORS headers
function createResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Function to generate a random state for OAuth
function generateRandomState() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Generate OAuth URL
function generateOAuthUrl(state: string, settings: FormSettings) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', SCOPES.join(' '));
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('state', encodeURIComponent(JSON.stringify({ state, settings })));
  return url.toString();
}

// Exchange code for token
async function exchangeCodeForToken(code: string) {
  console.log('Exchanging code for token');
  
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      throw new Error(`Failed to exchange token: ${tokenResponse.status} ${errorText}`);
    }

    return await tokenResponse.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// Create a Google Form
async function createGoogleForm(accessToken: string, settings: FormSettings) {
  console.log('Creating Google Form with settings:', settings);
  
  try {
    // 1. Create a new form
    const formTitle = `${settings.title} - ${settings.session}`;
    
    const createFormResponse = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title: formTitle,
          documentTitle: formTitle,
        }
      }),
    });

    if (!createFormResponse.ok) {
      const errorText = await createFormResponse.text();
      console.error('Create form error:', errorText);
      throw new Error(`Failed to create form: ${createFormResponse.status} ${errorText}`);
    }

    const formData = await createFormResponse.json();
    console.log('Form created:', formData.formId);

    // 2. Add form questions based on the settings
    const requests = [];
    let questionIndex = 0;

    // Add base fields for all forms
    const baseFields = ['rollNo', 'name'];
    
    // Check if we need to add program, year, semester, and session fields
    const metadataFields = ['program', 'year', 'semester', 'session'];
    
    // Combine all fields that need to be added
    const allFields = [
      ...baseFields,
      ...(settings.includeFields.filter(field => !baseFields.includes(field) && !metadataFields.includes(field))),
      ...(metadataFields.filter(field => settings.includeFields.includes(field))),
      ...settings.pdfFields,
      ...settings.customFields
    ];

    for (const field of allFields) {
      let fieldTitle = '';
      let fieldType = 'TEXT';
      let required = true;
      
      switch (field) {
        case 'rollNo':
          fieldTitle = 'Roll Number';
          break;
        case 'name':
          fieldTitle = 'Student Name';
          break;
        case 'email':
          fieldTitle = 'Email';
          break;
        case 'phoneNo':
          fieldTitle = 'Phone Number';
          break;
        case 'groupNo':
          fieldTitle = 'Group Number';
          break;
        case 'title':
          fieldTitle = 'Project Title';
          break;
        case 'domain':
          fieldTitle = 'Project Domain';
          break;
        case 'facultyMentor':
          fieldTitle = 'Faculty Mentor';
          break;
        case 'industryMentor':
          fieldTitle = 'Industry Mentor';
          required = false;
          break;
        case 'organization':
          fieldTitle = 'Organization';
          break;
        case 'dates':
          fieldTitle = 'Internship Dates';
          break;
        case 'form':
          fieldTitle = 'Project Proposal Form (PDF)';
          fieldType = 'FILE_UPLOAD';
          break;
        case 'presentation':
          fieldTitle = 'Final Presentation (PDF/PPT)';
          fieldType = 'FILE_UPLOAD';
          break;
        case 'report':
          fieldTitle = 'Project Report (PDF)';
          fieldType = 'FILE_UPLOAD';
          break;
        case 'noc':
          fieldTitle = 'No Objection Certificate (PDF)';
          fieldType = 'FILE_UPLOAD';
          break;
        case 'offerLetter':
          fieldTitle = 'Offer Letter (PDF)';
          fieldType = 'FILE_UPLOAD';
          break;
        case 'pop':
          fieldTitle = 'POP (PDF)';
          fieldType = 'FILE_UPLOAD';
          break;
        case 'program':
          fieldTitle = 'Program';
          fieldType = 'DROPDOWN';
          break;
        case 'year':
          fieldTitle = 'Year';
          fieldType = 'DROPDOWN';
          break;
        case 'semester':
          fieldTitle = 'Semester';
          fieldType = 'DROPDOWN';
          break;
        case 'session':
          fieldTitle = 'Session';
          break;
        default:
          // For custom fields
          fieldTitle = field;
          required = false;
      }

      const questionRequest: any = {
        createItem: {
          item: {
            title: fieldTitle,
            questionItem: {
              question: {
                required,
              }
            }
          },
          location: {
            index: questionIndex
          }
        }
      };

      // Configure field type
      if (fieldType === 'TEXT') {
        questionRequest.createItem.item.questionItem.question.textQuestion = {};
      } else if (fieldType === 'FILE_UPLOAD') {
        questionRequest.createItem.item.questionItem.question.fileUploadQuestion = {
          maxFiles: 1,
          maxFileSize: 10485760, // 10MB
          types: ['PDF', 'application/pdf']
        };
      } else if (fieldType === 'DROPDOWN') {
        let choices = [];
        
        if (field === 'program') {
          choices = [
            'BTech CSE', 'BTech CSE (FSD)', 'BTech CSE (UI/UX)', 'BTech AI/ML',
            'BSc CS', 'BSc DS', 'BSc Cyber', 'BCA', 'BCA (AI/DS)'
          ];
        } else if (field === 'year') {
          choices = ['1', '2', '3', '4'];
        } else if (field === 'semester') {
          choices = ['1', '2', '3', '4', '5', '6', '7', '8'];
        }
        
        questionRequest.createItem.item.questionItem.question.choiceQuestion = {
          type: 'DROPDOWN',
          options: choices.map(choice => ({ value: choice })),
        };
      }

      requests.push(questionRequest);
      questionIndex++;
    }

    // Update form with questions
    if (requests.length > 0) {
      const updateFormResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formData.formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests
        }),
      });

      if (!updateFormResponse.ok) {
        const errorText = await updateFormResponse.text();
        console.error('Update form error:', errorText);
        throw new Error(`Failed to update form: ${updateFormResponse.status} ${errorText}`);
      }

      console.log('Form questions added successfully');
    }

    // Get the form response URL
    const formUrl = `https://docs.google.com/forms/d/${formData.formId}/viewform`;
    console.log('Form URL:', formUrl);

    return {
      formId: formData.formId,
      formUrl
    };
  } catch (error) {
    console.error('Error creating Google Form:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop() || '';

  try {
    // Handle OAuth callback
    if (path === 'oauth-callback') {
      const code = url.searchParams.get('code');
      const stateParam = url.searchParams.get('state');
      
      if (!code || !stateParam) {
        return createResponse({ error: 'Missing code or state parameter' }, 400);
      }

      try {
        const { state, settings } = JSON.parse(decodeURIComponent(stateParam));
        console.log('OAuth callback received with state:', state);
        console.log('Form settings:', settings);

        // Exchange the authorization code for access and refresh tokens
        const tokens = await exchangeCodeForToken(code);
        console.log('Tokens received');

        // Create the Google Form
        const formData = await createGoogleForm(tokens.access_token, settings);

        // Redirect the user back to the application with the form URL
        const redirectUrl = new URL(url.origin);
        redirectUrl.pathname = '/oauth2/callback';
        redirectUrl.searchParams.append('formUrl', formData.formUrl);
        redirectUrl.searchParams.append('formId', formData.formId);
        
        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectUrl.toString(),
            ...corsHeaders
          }
        });
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        return createResponse({ error: 'Error processing OAuth callback' }, 500);
      }
    }
    
    // For the main endpoint (POST request)
    if (req.method === 'POST') {
      const requestData = await req.json();
      const { action, settings } = requestData;

      if (action === 'init-oauth') {
        // Start the OAuth flow
        if (!settings) {
          return createResponse({ error: 'Form settings are required' }, 400);
        }

        const state = generateRandomState();
        const authUrl = generateOAuthUrl(state, settings);
        
        return createResponse({ authUrl });
      }
      
      return createResponse({ error: 'Unknown action' }, 400);
    }

    return createResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Error:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
});
