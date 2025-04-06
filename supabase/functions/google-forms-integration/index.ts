
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Google API credentials
const GOOGLE_API_KEY = "AIzaSyBvoaFgVJkg1XyaLaFGsVaXFGlScCSXoJo";
const GOOGLE_CLIENT_ID = "973465958657-sqg9gqml2u004qfb2vgvl18f42nk8kqr.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

// Required OAuth scopes for Google Forms API
const SCOPES = [
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid"
];

function generateRedirectUri(req: Request): string {
  // Extract origin from request or use a default
  const url = new URL(req.url);
  const origin = url.origin;
  return `${origin}/oauth2callback`;
}

// Main handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { action } = await req.json();

      switch (action) {
        case 'setup':
          return handleSetup(req);
        case 'getAuthUrl':
          return handleGetAuthUrl(req);
        case 'exchangeCode':
          return handleExchangeCode(req);
        case 'createForm':
          return handleCreateForm(req);
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
      }
    }

    // Default response for non-POST methods
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handler for setup action - verifies API keys and settings
async function handleSetup(req: Request) {
  try {
    // Verify the Google API credentials work
    const testUrl = `https://forms.googleapis.com/$discovery/rest?version=v1&key=${GOOGLE_API_KEY}`;
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      throw new Error(`Google API test failed: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Forms API integration is properly configured',
        redirectUri: generateRedirectUri(req),
        scopes: SCOPES
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        setup: {
          requiredScopes: SCOPES,
          redirectUri: generateRedirectUri(req)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Generate OAuth 2.0 authentication URL
async function handleGetAuthUrl(req: Request) {
  const redirectUri = generateRedirectUri(req);
  
  // Create the OAuth2 authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', SCOPES.join(' '));
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  
  return new Response(
    JSON.stringify({ authUrl: authUrl.toString() }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Exchange authorization code for access token
async function handleExchangeCode(req: Request) {
  const { code } = await req.json();
  const redirectUri = generateRedirectUri(req);
  
  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Authorization code is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenResponse.ok) {
      return new Response(
        JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(tokenData.error_description || 'Failed to exchange token');
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Create a Google Form
async function handleCreateForm(req: Request) {
  const { access_token, title, description, fields } = await req.json();
  
  if (!access_token) {
    return new Response(
      JSON.stringify({ error: 'Access token is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  try {
    // Create the form
    const formResponse = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        info: {
          title: title || 'Internship Form',
          documentTitle: title || 'Internship Form',
          description: description || 'Submit your internship details'
        }
      })
    });
    
    const formData = await formResponse.json();
    
    if (!formResponse.ok) {
      throw new Error(formData.error?.message || 'Failed to create form');
    }
    
    const formId = formData.formId;
    
    // Add items to the form if fields are provided
    if (fields && fields.length > 0) {
      const requests = fields.map((field, index) => ({
        createItem: {
          item: {
            title: field.title,
            description: field.description,
            questionItem: {
              question: {
                required: field.required,
                textQuestion: {
                  paragraph: field.paragraph
                }
              }
            }
          },
          location: {
            index
          }
        }
      }));
      
      const updateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      });
      
      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        throw new Error(updateError.error?.message || 'Failed to add questions to form');
      }
    }
    
    // Get the form details including the response URL
    const getFormResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const getFormData = await getFormResponse.json();
    
    return new Response(
      JSON.stringify({
        formId: formId,
        responderUri: getFormData.responderUri,
        editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
        title: getFormData.info.title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Form creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
