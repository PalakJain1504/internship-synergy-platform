
import { createClient } from '@supabase/supabase-js';
import { ProjectData, Filter } from '@/lib/types';

// Initialize Supabase client
// Note: In a real app, these would be environment variables
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  
  return data as ProjectData[];
}

export async function uploadProject(project: ProjectData) {
  const { error } = await supabase
    .from('projects')
    .insert(project);
  
  if (error) {
    console.error('Error uploading project:', error);
    throw error;
  }
}

export async function uploadMultipleProjects(projects: ProjectData[]) {
  const { error } = await supabase
    .from('projects')
    .insert(projects);
  
  if (error) {
    console.error('Error uploading projects batch:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<ProjectData>) {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// File storage functions
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
