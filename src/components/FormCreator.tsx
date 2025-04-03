
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, FileText, ClipboardCheck } from 'lucide-react';

// Type for form settings
interface FormSettings {
  portalType: 'project' | 'internship';
  title: string;
  session: string;
  year: string;
  semester: string;
  program?: string;
  includeFields: string[];
  pdfFields: string[];
  customFields: string[];
}

interface FormCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: 'project' | 'internship';
  onFormCreated: (formSettings: FormSettings, formUrl: string) => void;
}

// Define base fields for each portal type
const projectBaseFields = [
  'groupNo', 'rollNo', 'name', 'email', 'phoneNo', 'title', 
  'domain', 'facultyMentor', 'industryMentor', 'facultyCoordinator'
];

const internshipBaseFields = [
  'rollNo', 'name', 'program', 'organization', 'dates'
];

// Define PDF fields for each portal type
const projectPdfFields = ['form', 'presentation', 'report'];
const internshipPdfFields = ['noc', 'offerLetter', 'pop'];

const fieldLabels: Record<string, string> = {
  groupNo: 'Group Number',
  rollNo: 'Roll Number',
  name: 'Student Name',
  email: 'Email',
  phoneNo: 'Phone Number',
  title: 'Project Title',
  domain: 'Domain',
  facultyMentor: 'Faculty Mentor',
  industryMentor: 'Industry Mentor',
  facultyCoordinator: 'Faculty Coordinator',
  program: 'Program',
  organization: 'Organization',
  dates: 'Dates',
  form: 'Form Document',
  presentation: 'Presentation',
  report: 'Report',
  noc: 'NOC',
  offerLetter: 'Offer Letter',
  pop: 'Proof of Participation'
};

// Define form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  session: z.string().min(1, "Session is required"),
  year: z.string().min(1, "Year is required"),
  semester: z.string().min(1, "Semester is required"),
  program: z.string().optional(),
  newFieldName: z.string().optional(),
});

const FormCreator: React.FC<FormCreatorProps> = ({
  isOpen, 
  onClose, 
  portalType, 
  onFormCreated
}) => {
  // Set up form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: `${portalType === 'project' ? 'Project' : 'Internship'} Submission Form`,
      session: '',
      year: '',
      semester: '',
      program: '',
      newFieldName: '',
    },
  });

  // Setup state for fields
  const baseFields = portalType === 'project' ? projectBaseFields : internshipBaseFields;
  const pdfFields = portalType === 'project' ? projectPdfFields : internshipPdfFields;
  
  const [selectedFields, setSelectedFields] = useState<string[]>(baseFields);
  const [selectedPdfFields, setSelectedPdfFields] = useState<string[]>(pdfFields);
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newCustomField, setNewCustomField] = useState<string>('');

  // Handle adding custom field
  const addCustomField = () => {
    if (!newCustomField.trim()) return;

    // Check if field already exists
    if ([...baseFields, ...customFields].includes(newCustomField)) {
      toast.error('This field already exists');
      return;
    }

    setCustomFields([...customFields, newCustomField]);
    setSelectedFields([...selectedFields, newCustomField]);
    setNewCustomField('');
  };

  // Handle toggling fields
  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  // Handle toggling PDF fields
  const togglePdfField = (field: string) => {
    if (selectedPdfFields.includes(field)) {
      setSelectedPdfFields(selectedPdfFields.filter(f => f !== field));
    } else {
      setSelectedPdfFields([...selectedPdfFields, field]);
    }
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    if (selectedPdfFields.length === 0) {
      toast.error('Please select at least one PDF field');
      return;
    }

    // Create form settings
    const formSettings: FormSettings = {
      portalType,
      title: values.title,
      session: values.session,
      year: values.year,
      semester: values.semester,
      program: values.program,
      includeFields: selectedFields,
      pdfFields: selectedPdfFields,
      customFields,
    };

    // Generate a mock Google Form URL (in a real scenario, this would call an API)
    const formUrl = `https://docs.google.com/forms/d/${Date.now()}/viewform`;
    
    // Notify success
    toast.success('Form created successfully!');
    onFormCreated(formSettings, formUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create {portalType === 'project' ? 'Project' : 'Internship'} Submission Form</DialogTitle>
          <DialogDescription>
            Generate a customized Google Form for data collection. Select the fields you want to include.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter form title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2024-2025" {...field} />
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
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3" {...field} />
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
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {portalType === 'internship' && (
                <FormField
                  control={form.control}
                  name="program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., B.Tech" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {/* Field Selection Section */}
            <div>
              <h3 className="text-base font-medium mb-2">Base Fields</h3>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {baseFields.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`field-${field}`} 
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => toggleField(field)}
                      />
                      <Label htmlFor={`field-${field}`}>{fieldLabels[field] || field}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* PDF Fields Section */}
            <div>
              <h3 className="text-base font-medium mb-2">PDF File Upload Fields</h3>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {pdfFields.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`pdf-${field}`} 
                        checked={selectedPdfFields.includes(field)}
                        onCheckedChange={() => togglePdfField(field)}
                      />
                      <Label htmlFor={`pdf-${field}`}>{fieldLabels[field] || field}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Custom Fields Section */}
            <div>
              <h3 className="text-base font-medium mb-2">Custom Fields</h3>
              <div className="border rounded-md p-4 bg-gray-50">
                {customFields.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {customFields.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`custom-${field}`} 
                          checked={selectedFields.includes(field)}
                          onCheckedChange={() => toggleField(field)}
                        />
                        <Label htmlFor={`custom-${field}`}>{field}</Label>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500"
                          onClick={() => {
                            setCustomFields(customFields.filter(f => f !== field));
                            setSelectedFields(selectedFields.filter(f => f !== field));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No custom fields added yet.</p>
                )}
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="New field name"
                    value={newCustomField}
                    onChange={(e) => setNewCustomField(e.target.value)}
                    className="text-sm"
                  />
                  <Button type="button" onClick={addCustomField} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <FileText className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FormCreator;
