
# Supabase Database Structure for Progress Port

This document outlines the necessary database structure for the Progress Port application in Supabase.

## Database Tables

### 1. Projects Table

Table Name: `projects`

Columns:
- `id` (uuid, primary key): Unique identifier for each project record
- `group_no` (text): Group number
- `roll_no` (text): Roll number of the student
- `name` (text): Name of the student
- `email` (text): Email of the student
- `phone_no` (text): Phone number of the student
- `title` (text): Project title
- `domain` (text): Project domain
- `faculty_mentor` (text): Faculty mentor name
- `industry_mentor` (text): Industry mentor name
- `form` (text): File reference for the form
- `presentation` (text): File reference for the presentation
- `report` (text): File reference for the report
- `year` (text): Academic year
- `semester` (text): Semester
- `session` (text): Academic session (e.g., "2024-2025")
- `faculty_coordinator` (text): Faculty coordinator name
- `created_at` (timestamp with time zone, default: now()): Record creation timestamp
- `updated_at` (timestamp with time zone, default: now()): Record update timestamp

### 2. Internships Table

Table Name: `internships`

Columns:
- `id` (uuid, primary key): Unique identifier for each internship record
- `roll_no` (text): Roll number of the student
- `name` (text): Name of the student
- `program` (text): Academic program (e.g., B.Tech, M.Tech)
- `organization` (text): Organization where internship was done
- `dates` (text): Duration of the internship
- `noc` (text): File reference for No Objection Certificate
- `offer_letter` (text): File reference for Offer Letter
- `pop` (text): File reference for Proof of Participation
- `year` (text): Academic year
- `semester` (text): Semester
- `session` (text): Academic session (e.g., "2024-2025")
- `created_at` (timestamp with time zone, default: now()): Record creation timestamp
- `updated_at` (timestamp with time zone, default: now()): Record update timestamp

### 3. Attendance Table (Optional - for dynamic attendance columns)

Table Name: `attendance`

Columns:
- `id` (uuid, primary key): Unique identifier for each attendance record
- `internship_id` (uuid, foreign key to internships.id): Reference to the internship record
- `month` (text): Month for the attendance (e.g., "January", "February")
- `file_reference` (text): File reference for the attendance document
- `created_at` (timestamp with time zone, default: now()): Record creation timestamp
- `updated_at` (timestamp with time zone, default: now()): Record update timestamp

## Storage Buckets

Create the following storage buckets for file uploads:

1. `project-files`: For storing project-related files
   - Suggested subfolders:
     - `/forms`
     - `/presentations`
     - `/reports`

2. `internship-files`: For storing internship-related files
   - Suggested subfolders:
     - `/noc`
     - `/offer-letters`
     - `/pop`
     - `/attendance`

## Row Level Security (RLS) Policies

Set up the following RLS policies:

### Projects Table

```sql
-- Enable read access for authenticated users
CREATE POLICY "Enable read access for authenticated users"
ON public.projects
FOR SELECT
USING (auth.role() = 'authenticated');

-- Enable insert access for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON public.projects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Enable update access for authenticated users
CREATE POLICY "Enable update for authenticated users"
ON public.projects
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Enable delete access for authenticated users
CREATE POLICY "Enable delete for authenticated users"
ON public.projects
FOR DELETE
USING (auth.role() = 'authenticated');
```

### Internships Table

```sql
-- Enable read access for authenticated users
CREATE POLICY "Enable read access for authenticated users"
ON public.internships
FOR SELECT
USING (auth.role() = 'authenticated');

-- Enable insert access for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON public.internships
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Enable update access for authenticated users
CREATE POLICY "Enable update for authenticated users"
ON public.internships
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Enable delete access for authenticated users
CREATE POLICY "Enable delete for authenticated users"
ON public.internships
FOR DELETE
USING (auth.role() = 'authenticated');
```

### Storage Buckets

```sql
-- Enable read access for authenticated users
CREATE POLICY "Enable read access for authenticated users"
ON storage.objects
FOR SELECT
USING (auth.role() = 'authenticated');

-- Enable insert access for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON storage.objects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Enable update access for authenticated users
CREATE POLICY "Enable update for authenticated users"
ON storage.objects
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Enable delete access for authenticated users
CREATE POLICY "Enable delete for authenticated users"
ON storage.objects
FOR DELETE
USING (auth.role() = 'authenticated');
```

## Integration Steps

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the database tables listed above
3. Set up the storage buckets
4. Configure the RLS policies
5. Update the `supabaseService.ts` file with your Supabase URL and anon key:

```typescript
// In src/services/supabaseService.ts

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
```

6. Connect Lovable to your Supabase project through the Supabase integration option in the Lovable interface

Once these steps are complete, your application will be using Supabase for data storage rather than the sample data currently in use.
