
import { createClient } from '@supabase/supabase-js';
import { ProjectData, Filter, InternshipData, ProjectEntry, InternshipEntry } from '@/lib/types';

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

// Create a client with your Supabase credentials
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to normalize course names
const normalizeCourse = (course: string): string => {
  // Convert to lowercase and remove dots and spaces
  const normalized = course.toLowerCase().replace(/\s|\./g, '');
  
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

// Project data functions
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
    if (filters.course && filters.course !== 'all-courses') {
      query = query.eq('course', filters.course);
    }
    if (filters.facultyCoordinator && filters.facultyCoordinator !== 'all-coordinators') {
      query = query.eq('facultyCoordinator', filters.facultyCoordinator);
    }
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
  
  return data as ProjectEntry[];
}

export async function uploadProject(project: ProjectEntry) {
  const { error } = await supabase
    .from('projects')
    .insert(project);
  
  if (error) {
    console.error('Error uploading project:', error);
    throw error;
  }
}

export async function uploadMultipleProjects(projects: ProjectEntry[]) {
  const { error } = await supabase
    .from('projects')
    .insert(projects);
  
  if (error) {
    console.error('Error uploading projects batch:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<ProjectEntry>) {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// Internship data functions
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
    if (filters.course && filters.course !== 'all-courses') {
      query = query.eq('course', filters.course);
    }
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
  
  return data as InternshipEntry[];
}

export async function uploadInternship(internship: InternshipEntry) {
  const { error } = await supabase
    .from('internships')
    .insert(internship);
  
  if (error) {
    console.error('Error uploading internship:', error);
    throw error;
  }
}

export async function uploadMultipleInternships(internships: InternshipEntry[]) {
  const { error } = await supabase
    .from('internships')
    .insert(internships);
  
  if (error) {
    console.error('Error uploading internships batch:', error);
    throw error;
  }
}

export async function updateInternship(id: string, updates: Partial<InternshipEntry>) {
  const { error } = await supabase
    .from('internships')
    .update(updates)
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
