
import React, { useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { initiateGoogleAuth } from '@/services/googleFormsService';
import { FormSettings } from '@/lib/types';

interface FormCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: 'project' | 'internship';
  onFormCreated: (formSettings: FormSettings, formUrl: string) => void;
}

const FormCreator: React.FC<FormCreatorProps> = ({ isOpen, onClose, portalType, onFormCreated }) => {
  const [isCreating, setIsCreating] = useState(false);

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Form title must be at least 2 characters.",
    }),
    session: z.string().min(2, {
      message: "Session must be at least 2 characters.",
    }),
    year: z.string().min(1, {
      message: "Year must be at least 1 character.",
    }),
    semester: z.string().min(1, {
      message: "Semester must be at least 1 character.",
    }),
    program: z.string().min(2, {
      message: "Program must be at least 2 characters.",
    }),
    minStudents: z.number().min(1, {
      message: "Min students must be at least 1.",
    }).optional().default(1),
    maxStudents: z.number().min(1, {
      message: "Max students must be at least 1.",
    }).optional().default(1),
    includeFields: z.array(z.string()),
    pdfFields: z.array(z.string()),
    customFields: z.array(z.string()).default([]),
  });

  // Define the default form fields based on portal type
  const defaultFormFields = portalType === 'project' ? 
    ['rollNo', 'name', 'email', 'phoneNo', 'groupNo', 'title', 'domain', 'facultyMentor', 'industryMentor'] : 
    ['rollNo', 'name', 'program', 'organization', 'dates'];

  // Define the metadata fields that are not displayed directly to students in the form
  // but are managed by faculty and needed for data organization
  const metadataFields = ['year', 'semester', 'session'];

  // Fields to include in the base form
  const baseFields = portalType === 'project' ? 
    [...defaultFormFields, ...metadataFields] : 
    [...defaultFormFields, ...metadataFields];
  
  // Optional additional fields for internships
  const additionalInternshipFields = ['internshipDuration', 'mobileNumber'];

  const defaultPdfFields = portalType === 'project' ? 
    ['form', 'presentation', 'report'] : 
    ['noc', 'offerLetter', 'pop'];

  const defaultSettings = {
    title: '',
    session: '',
    year: '',
    semester: '',
    program: '',
    minStudents: 1,
    maxStudents: 1,
    includeFields: baseFields,
    pdfFields: defaultPdfFields,
    customFields: [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultSettings,
    mode: "onChange"
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    try {
      // Add the portalType to the form settings
      const formSettingsWithType: FormSettings = {
        ...values,
        portalType,
        title: values.title,
        session: values.session,
        year: values.year,
        semester: values.semester,
        program: values.program,
        includeFields: values.includeFields,
        pdfFields: values.pdfFields,
        customFields: values.customFields || [],
      };
      
      const authUrl = await initiateGoogleAuth(formSettingsWithType);
      window.location.href = authUrl;
      onClose();
    } catch (error: any) {
      console.error('Error creating form:', error);
      alert(`Failed to create form: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto h-screen pb-20">
        <SheetHeader>
          <SheetTitle>Create New Form</SheetTitle>
          <SheetDescription>
            Create a new Google Form to collect data for {portalType} portal.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 pb-16">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Title</FormLabel>
                  <FormDescription>
                    Give your form a clear and descriptive title.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder={portalType === 'project' ? "Project Data Collection" : "Internship Data Collection"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-4">
              <Label>Base Fields</Label>
              <FormDescription>
                Select the base fields you want to include in the form.
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultFormFields.map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name="includeFields"
                    render={({ field: { value, onChange } }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                        <FormLabel className="text-sm font-normal">
                          {field === 'rollNo' ? 'Roll Number' :
                            field === 'name' ? 'Student Name' :
                              field === 'email' ? 'Email' :
                                field === 'phoneNo' ? 'Phone Number' :
                                  field === 'groupNo' ? 'Group Number' :
                                    field === 'title' ? 'Project Title' :
                                      field === 'domain' ? 'Project Domain' :
                                        field === 'facultyMentor' ? 'Faculty Mentor' :
                                          field === 'industryMentor' ? 'Industry Mentor' :
                                            field === 'organization' ? 'Organization' :
                                              field === 'dates' ? 'Internship Dates' :
                                                field}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={value?.includes(field)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                onChange([...value, field])
                              } else {
                                onChange(value?.filter((v) => v !== field))
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            
            {portalType === 'internship' && (
              <div className="flex flex-col space-y-4">
                <Label>Additional Fields</Label>
                <FormDescription>
                  Select additional fields for internship data.
                </FormDescription>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {additionalInternshipFields.map((field) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name="includeFields"
                      render={({ field: { value, onChange } }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                          <FormLabel className="text-sm font-normal">
                            {field === 'internshipDuration' ? 'Internship Duration' :
                             field === 'mobileNumber' ? 'Mobile Number' : field}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={value?.includes(field)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  onChange([...value, field])
                                } else {
                                  onChange(value?.filter((v) => v !== field))
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {portalType === 'project' && (
              <>
                <FormField
                  control={form.control}
                  name="minStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Students per Group</FormLabel>
                      <FormDescription>
                        Minimum number of students allowed in each group.
                      </FormDescription>
                      <FormControl>
                        <Input 
                          type="number" 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          value={field.value || 1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Students per Group</FormLabel>
                      <FormDescription>
                        Maximum number of students allowed in each group.
                      </FormDescription>
                      <FormControl>
                        <Input 
                          type="number" 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          value={field.value || 1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Session</FormLabel>
                  <FormDescription>
                    Enter the default session value for this form.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="2023-2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Year</FormLabel>
                  <FormDescription>
                    Enter the default year value for this form.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Semester</FormLabel>
                  <FormDescription>
                    Enter the default semester value for this form.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="8" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Program</FormLabel>
                  <FormDescription>
                    Enter the default program value for this form.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="B.Tech CSE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-4">
              <Label>PDF File Upload Fields</Label>
              <FormDescription>
                Select which PDF file upload fields you want to include.
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultPdfFields.map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name="pdfFields"
                    render={({ field: { value, onChange } }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                        <FormLabel className="text-sm font-normal">
                          {field === 'form' ? 'Project Proposal Form' : 
                           field === 'presentation' ? 'Final Presentation' : 
                           field === 'report' ? 'Project Report' : 
                           field === 'noc' ? 'No Objection Certificate' : 
                           field === 'offerLetter' ? 'Offer Letter' : 
                           field === 'pop' ? 'POP' : 
                           field}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={value?.includes(field)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                onChange([...value, field]);
                              } else {
                                onChange(value?.filter(v => v !== field));
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="sticky bottom-0 py-4 bg-white border-t mt-8">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Form"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default FormCreator;
