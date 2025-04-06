import { supabase } from '@/integrations/supabase/client';
import { InternshipData } from '@/lib/types';

// Function to fetch all internships from Supabase
export const fetchInternships = async (): Promise<InternshipData[]> => {
  try {
    const { data, error } = await supabase
      .from('internships')
      .select('*');

    if (error) {
      console.error('Error fetching internships from Supabase:', error);
      throw error;
    }

    return data as InternshipData[];
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
};

// Function to upload a single internship to Supabase
export const uploadInternship = async (internship: InternshipData): Promise<{ success: boolean, error?: any }> => {
  try {
    // Convert any non-string faculty_coordinator to string
    const formattedInternship = {
      ...internship,
      faculty_coordinator: typeof internship.faculty_coordinator === 'boolean' 
        ? String(internship.faculty_coordinator) 
        : internship.faculty_coordinator
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
        faculty_coordinator: String(formattedInternship.faculty_coordinator)
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error uploading internship to Supabase:', error);
    return { success: false, error };
  }
};

// Function to upload multiple internships to Supabase
export const uploadMultipleInternships = async (internships: InternshipData[]): Promise<{ success: boolean, error?: any }> => {
  try {
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
      faculty_coordinator: typeof internship.faculty_coordinator === 'boolean' 
        ? String(internship.faculty_coordinator) 
        : String(internship.faculty_coordinator)
    }));

    const { error } = await supabase
      .from('internships')
      .insert(formattedInternships);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error uploading multiple internships to Supabase:', error);
    return { success: false, error };
  }
};
