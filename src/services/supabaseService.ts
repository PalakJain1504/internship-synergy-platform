
import { createClient } from '@supabase/supabase-js';
import { ProjectData, Filter, InternshipData, ProjectEntry, InternshipEntry } from '@/lib/types';

// Initialize Supabase client

// Note: In a real app, these would be environment variables
const supabaseUrl = 'https://zslbfvtqqzwxiwmbzpdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbGJmdnRxcXp3eGl3bWJ6cGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MzYzOTcsImV4cCI6MjA1ODIxMjM5N30.DpJ76e3anHUJ3aPypyj2jsiXcbRv6Mjh_BMipmtQHCU';

// Create a client with your Supabase credentials
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to normalize program names
const normalizeProgram = (program: string): string => {
  // Convert to lowercase and remove dots and spaces
  const normalized = program.toLowerCase().replace(/\s|\./g, '');
  
  // Map common variations
  const mappings: Record<string, string> = {
    'btech': 'btech',
    'btechcse': 'btechcse',
    'btechai': 'btechai/ml',
    'btechaiml': 'btechai/ml',
    'btechaids': 'btechai/ds',
    'bsc': 'bsc',
    'bca': 'bca',
    'bcaai': 'bcaai/ds',
    'bcaaids': 'bcaai/ds',
    'mca': 'mca'
  };
  
  // Find the best match
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return normalized;
};

// Function to normalize course/program names (needed for file system paths)
const normalizeCourse = (course: string): string => {
  const normalized = course.toLowerCase().replace(/\s|\./g, '');
  return normalized;
};

// Project data functions
const projectToDbFormat = (project: ProjectData) => {
  const { isEditing, isNew, ...data } = project;
  return {
    id: data.id,
    group_no: data.groupNo,
    roll_no: data.rollNo,
    name: data.name,
    email: data.email,
    phone_no: data.phoneNo,
    title: data.title,
    domain: data.domain,
    faculty_mentor: data.facultyMentor,
    industry_mentor: data.industryMentor,
    form: data.form,
    presentation: data.presentation,
    report: data.report,
    year: data.year,
    semester: data.semester,
    session: data.session,
    program: data.program,
    faculty_coordinator: data.facultyCoordinator,
  };
};

const dbToProjectFormat = (dbProject: any): ProjectEntry => {
  return {
    id: dbProject.id,
    groupNo: dbProject.group_no || '',
    rollNo: dbProject.roll_no || '',
    name: dbProject.name || '',
    email: dbProject.email || '',
    phoneNo: dbProject.phone_no || '',
    title: dbProject.title || '',
    domain: dbProject.domain || '',
    facultyMentor: dbProject.faculty_mentor || '',
    industryMentor: dbProject.industry_mentor || '',
    form: dbProject.form || '',
    presentation: dbProject.presentation || '',
    report: dbProject.report || '',
    year: dbProject.year || '',
    semester: dbProject.semester || '',
    session: dbProject.session || '',
    program: dbProject.program || '',
    facultyCoordinator: dbProject.faculty_coordinator || '',
  };
};

export async function fetchProjects(filters?: Filter) {
  let query = supabase
    .from('projects')
    .select('*');

  // Apply filters
  if (filters) {
    if (filters.year && filters.year !== 'all-years') {
      query = query.eq('year', filters.year);
    }
    if (filters.semester && filters.semester !== 'all-semesters') {
      query = query.eq('semester', filters.semester);
    }
    if (filters.session && filters.session !== 'all-sessions') {
      query = query.eq('session', filters.session);
    }
    if (filters.program && filters.program !== 'all-programs') {
      query = query.eq('program', filters.program);
    }
    if (filters.facultyCoordinator && filters.facultyCoordinator !== 'all-coordinators') {
      query = query.eq('faculty_coordinator', filters.facultyCoordinator);
    }
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
  
  return data.map(dbToProjectFormat) as ProjectEntry[];
}

export async function uploadProject(project: ProjectEntry) {
  const dbProject = projectToDbFormat(project);
  const { error } = await supabase
    .from('projects')
    .insert(dbProject);
  
  if (error) {
    console.error('Error uploading project:', error);
    throw error;
  }
}

export async function uploadMultipleProjects(projects: ProjectEntry[]) {
  if (!projects || projects.length === 0) {
    console.error('No projects provided for upload');
    throw new Error('No projects provided for upload');
  }
  
  console.log(`Uploading ${projects.length} projects to Supabase`);
  
  try {
    // First convert all projects to database format
    const dbProjects = projects.map(projectToDbFormat);
    
    // Process in smaller batches to avoid potential size limitations
    const BATCH_SIZE = 20;
    const batches = [];
    
    for (let i = 0; i < dbProjects.length; i += BATCH_SIZE) {
      batches.push(dbProjects.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Split into ${batches.length} batches of max ${BATCH_SIZE} records each`);
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} records`);
      
      const { data, error } = await supabase
        .from('projects')
        .insert(batch)
        .select(); // Add select to get returned data
      
      if (error) {
        console.error(`Error uploading batch ${i+1}:`, error);
        throw error;
      }
      
      console.log(`Successfully uploaded batch ${i+1}, received ${data?.length} records back`);
    }
    
    console.log('All projects uploaded successfully');
  } catch (error) {
    console.error('Error in uploadMultipleProjects:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<ProjectEntry>) {
  const { isEditing, isNew, ...projectUpdates } = updates;
  const dbUpdates: Record<string, any> = {};
  
  // Convert camelCase to snake_case for database fields
  Object.entries(projectUpdates).forEach(([key, value]) => {
    if (key === 'groupNo') dbUpdates.group_no = value;
    else if (key === 'rollNo') dbUpdates.roll_no = value;
    else if (key === 'phoneNo') dbUpdates.phone_no = value;
    else if (key === 'facultyMentor') dbUpdates.faculty_mentor = value;
    else if (key === 'industryMentor') dbUpdates.industry_mentor = value;
    else if (key === 'facultyCoordinator') dbUpdates.faculty_coordinator = value;
    else dbUpdates[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = value;
  });

  const { error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// Internship data functions
const internshipToDbFormat = (internship: InternshipData) => {
  const { isEditing, isNew, ...data } = internship;
  
  // Extract base fields
  const baseFields = {
    id: data.id,
    roll_no: data.rollNo,
    name: data.name,
    program: data.program,
    organization: data.organization,
    dates: data.dates,
    noc: data.noc,
    offer_letter: data.offerLetter,
    pop: data.pop,
    year: data.year,
    semester: data.semester,
    session: data.session,
  };
  
  // Extract attendance and other dynamic fields
  const dynamicFields: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!Object.keys(baseFields).includes(key.replace(/([A-Z])/g, '_$1').toLowerCase()) && 
        key !== 'isEditing' && 
        key !== 'isNew' && 
        typeof value === 'string') {
      
      dynamicFields[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = value;
    }
  });
  
  return { ...baseFields, ...dynamicFields };
};

const dbToInternshipFormat = (dbInternship: any): InternshipEntry => {
  // Start with base fields
  const internship: Record<string, string> = {
    id: dbInternship.id,
    rollNo: dbInternship.roll_no || '',
    name: dbInternship.name || '',
    program: dbInternship.program || '',
    organization: dbInternship.organization || '',
    dates: dbInternship.dates || '',
    noc: dbInternship.noc || '',
    offerLetter: dbInternship.offer_letter || '',
    pop: dbInternship.pop || '',
    year: dbInternship.year || '',
    semester: dbInternship.semester || '',
    session: dbInternship.session || '',
  };
  
  // Add all other fields from the database record (supporting dynamic columns)
  Object.entries(dbInternship).forEach(([key, value]) => {
    if (!['id', 'roll_no', 'name', 'program', 'organization', 'dates', 'noc', 
         'offer_letter', 'pop', 'year', 'semester', 'session', 'created_at', 'updated_at'].includes(key)) {
      
      // Convert snake_case to camelCase or keep original for special names
      if (key.includes('attendance')) {
        // Special handling for attendance fields to preserve month capitalization
        const parts = key.split('_');
        if (parts.length >= 2) {
          const monthPart = parts[1];
          const month = monthPart.charAt(0).toUpperCase() + monthPart.slice(1);
          internship[`Attendance ${month}`] = value as string || '';
        }
      } else {
        // Regular conversion for other fields
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        internship[camelKey] = value as string || '';
      }
    }
  });
  
  return internship as InternshipEntry;
};

export async function fetchInternships(filters?: Filter) {
  let query = supabase
    .from('internships')
    .select('*');

  // Apply filters
  if (filters) {
    if (filters.year && filters.year !== 'all-years') {
      query = query.eq('year', filters.year);
    }
    if (filters.semester && filters.semester !== 'all-semesters') {
      query = query.eq('semester', filters.semester);
    }
    if (filters.session && filters.session !== 'all-sessions') {
      query = query.eq('session', filters.session);
    }
    if (filters.program && filters.program !== 'all-programs') {
      query = query.eq('program', filters.program);
    }
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
  
  return data.map(dbToInternshipFormat) as InternshipEntry[];
}

export async function uploadInternship(internship: InternshipEntry) {
  const dbInternship = internshipToDbFormat(internship);
  const { error } = await supabase
    .from('internships')
    .insert(dbInternship);
  
  if (error) {
    console.error('Error uploading internship:', error);
    throw error;
  }
}

export async function uploadMultipleInternships(internships: InternshipEntry[]) {
  if (!internships || internships.length === 0) {
    console.error('No internships provided for upload');
    throw new Error('No internships provided for upload');
  }
  
  console.log(`Uploading ${internships.length} internships to Supabase`);
  
  try {
    // First convert all internships to database format
    const dbInternships = internships.map(internshipToDbFormat);
    
    // Process in smaller batches to avoid potential size limitations
    const BATCH_SIZE = 10; // Reduced batch size for better reliability
    const batches = [];
    
    for (let i = 0; i < dbInternships.length; i += BATCH_SIZE) {
      batches.push(dbInternships.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Split into ${batches.length} batches of max ${BATCH_SIZE} records each`);
    
    let totalProcessed = 0;
    let successCount = 0;
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} records`);
      
      try {
        const { data, error } = await supabase
          .from('internships')
          .insert(batch)
          .select();
        
        if (error) {
          console.error(`Error uploading batch ${i+1}:`, error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          
          // Try inserting records one by one to bypass the problematic records
          console.log('Attempting to insert records individually...');
          for (const record of batch) {
            try {
              const { data: singleData, error: singleError } = await supabase
                .from('internships')
                .insert(record)
                .select();
              
              if (singleError) {
                console.error(`Failed to insert record:`, JSON.stringify(record, null, 2));
                console.error('Error:', singleError);
              } else {
                successCount++;
                console.log('Successfully inserted individual record');
              }
            } catch (individualError) {
              console.error('Error inserting individual record:', individualError);
            }
          }
        } else {
          successCount += data?.length || 0;
          console.log(`Successfully uploaded batch ${i+1}, received ${data?.length} records back`);
        }
        
        totalProcessed += batch.length;
      } catch (batchError) {
        console.error(`Error processing batch ${i+1}:`, batchError);
      }
    }
    
    if (successCount === 0) {
      throw new Error(`Failed to upload any records to Supabase. Please check the console for details.`);
    }
    
    console.log(`Successfully uploaded ${successCount}/${totalProcessed} internships`);
    return successCount;
  } catch (error) {
    console.error('Error in uploadMultipleInternships:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function updateInternship(id: string, updates: Partial<InternshipEntry>) {
  const { isEditing, isNew, ...internshipUpdates } = updates;
  const dbUpdates: Record<string, any> = {};
  
  // Convert camelCase to snake_case for database fields
  Object.entries(internshipUpdates).forEach(([key, value]) => {
    if (key === 'rollNo') dbUpdates.roll_no = value;
    else if (key === 'offerLetter') dbUpdates.offer_letter = value;
    else if (key.startsWith('Attendance')) {
      // Special handling for attendance fields
      const month = key.replace('Attendance ', '').toLowerCase();
      dbUpdates[`attendance_${month}`] = value;
    }
    else dbUpdates[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = value;
  });

  const { error } = await supabase
    .from('internships')
    .update(dbUpdates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating internship:', error);
    throw error;
  }
}

// File storage functions - modified to handle nested paths based on course and group
export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase
    .storage
    .from('project-files')
    .upload(path, file);
  
  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
  
  return data;
}

export async function getFilesInFolder(portalType: string, fieldType: string, courseFolder: string, groupFolder: string) {
  // Normalize the course name to handle variations
  const normalizedCourse = normalizeCourse(courseFolder);
  
  // Create a path structure: portalType/fieldType/courseFolder/groupFolder/
  const path = `${portalType}/${fieldType}/${normalizedCourse}/${groupFolder}/`;
  
  const { data, error } = await supabase
    .storage
    .from('project-files')
    .list(path);
  
  if (error) {
    console.error('Error listing files:', error);
    throw error;
  }
  
  return data;
}

export async function getFileUrl(path: string) {
  const { data } = await supabase
    .storage
    .from('project-files')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

export async function deleteFile(path: string) {
  const { error } = await supabase
    .storage
    .from('project-files')
    .remove([path]);
  
  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Function to parse Excel data
export async function parseExcelData(file: File) {
  console.log('Parsing Excel file:', file.name);
  
  return [];
}
