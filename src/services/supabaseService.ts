
import { supabase } from '@/integrations/supabase/client';
import { InternshipData } from '@/lib/types';

// Function to fetch all internships from Supabase
export const fetchInternships = async (): Promise<InternshipData[]> => {
  try {
    console.log('Fetching internships from Supabase...');
    
    const { data, error } = await supabase
      .from('internships')
      .select('*');

    if (error) {
      console.error('Error fetching internships from Supabase:', error);
      throw error;
    }

    console.log('Raw data from Supabase:', data);

    // Transform the data to match the InternshipData interface
    const formattedData: InternshipData[] = data.map(item => ({
      id: item.id,
      rollNo: item.roll_no || '',
      name: item.name || '',
      program: item.program || '',
      organization: item.organization || '',
      dates: item.dates || '',
      noc: item.noc || '',
      offerLetter: item.offer_letter || '',
      pop: item.pop || '',
      year: item.year || '',
      semester: item.semester || '',
      session: item.session || '',
      faculty_coordinator: String(item.faculty_coordinator || '')
    }));

    console.log('Formatted data:', formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
};

// Function to upload a single internship to Supabase
export const uploadInternship = async (internship: InternshipData): Promise<{ success: boolean, error?: any }> => {
  try {
    console.log('Uploading internship to Supabase:', internship);
    
    // Convert any faculty_coordinator field to string
    const formattedInternship = {
      ...internship,
      faculty_coordinator: String(internship.faculty_coordinator || '')
    };

    const { error } = await supabase
      .from('internships')
      .insert({
        id: formattedInternship.id,
        roll_no: formattedInternship.rollNo,
        name: formattedInternship.name,
        program: formattedInternship.program,
        organization: formattedInternship.organization,
        dates: formattedInternship.dates,
        noc: formattedInternship.noc,
        offer_letter: formattedInternship.offerLetter,
        pop: formattedInternship.pop,
        year: formattedInternship.year,
        semester: formattedInternship.semester,
        session: formattedInternship.session,
        faculty_coordinator: String(formattedInternship.faculty_coordinator || '')
      });

    if (error) {
      console.error('Error uploading internship to Supabase:', error);
      throw error;
    }
    
    console.log('Internship uploaded successfully');
    return { success: true };
  } catch (error) {
    console.error('Error uploading internship to Supabase:', error);
    return { success: false, error };
  }
};

// Function to upload multiple internships to Supabase
export const uploadMultipleInternships = async (internships: InternshipData[]): Promise<{ success: boolean, error?: any }> => {
  try {
    console.log('Uploading multiple internships to Supabase:', internships);
    
    const formattedInternships = internships.map(internship => ({
      id: internship.id,
      roll_no: internship.rollNo,
      name: internship.name,
      program: internship.program,
      organization: internship.organization,
      dates: internship.dates,
      noc: internship.noc,
      offer_letter: internship.offerLetter,
      pop: internship.pop,
      year: internship.year,
      semester: internship.semester,
      session: internship.session,
      faculty_coordinator: String(internship.faculty_coordinator || '')
    }));

    // Log internships for debugging
    console.log('Formatted internships for Supabase:', formattedInternships);

    const { error } = await supabase
      .from('internships')
      .insert(formattedInternships);

    if (error) {
      console.error('Supabase error when uploading internships:', error);
      throw error;
    }
    
    console.log('Multiple internships uploaded successfully');
    return { success: true };
  } catch (error) {
    console.error('Error uploading multiple internships to Supabase:', error);
    return { success: false, error };
  }
};

// Create an edge function for Google Forms integration
export const setupGoogleFormsIntegration = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Setting up Google Forms integration...');
    
    const result = await supabase.functions.invoke('google-forms-integration', {
      body: { action: 'setup' }
    });
    
    if (result.error) {
      console.error('Error setting up Google Forms integration:', result.error);
      throw new Error(result.error.message);
    }
    
    console.log('Google Forms integration set up successfully');
    return { success: true, message: 'Google Forms integration set up successfully' };
  } catch (error) {
    console.error('Error setting up Google Forms integration:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
