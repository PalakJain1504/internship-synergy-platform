
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface FormLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  formUrl: string;
  embedCode: string;
}

const FormLinkDialog: React.FC<FormLinkDialogProps> = ({
  isOpen,
  onClose,
  formTitle,
  formUrl,
  embedCode,
}) => {
  const [copyLinkStatus, setCopyLinkStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopyLinkStatus('copied');
      toast.success('Link copied to clipboard');
      
      // Reset after 2 seconds
      setTimeout(() => setCopyLinkStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please try manually selecting and copying.');
    }
  };

  const handleVisitForm = () => {
    // Ensure the URL has the proper format before opening
    const formattedUrl = formUrl.startsWith('http') ? formUrl : `https://${formUrl}`;
    window.open(formattedUrl, '_blank');
  };

  const handleEditForm = () => {
    // Convert viewform URL to edit URL
    const editUrl = formUrl.replace(/\/viewform$/, '/edit');
    window.open(editUrl, '_blank');
    toast.info('Opening form editor. You may need to sign in to your Google account.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Form Created Successfully</DialogTitle>
          <DialogDescription>
            Your form "{formTitle}" has been created. You can share the link with students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="form-link">Form Link</Label>
            <div className="flex items-stretch gap-2">
              <Input
                id="form-link"
                value={formUrl}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {copyLinkStatus === 'copied' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with students to allow them to submit their information.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:order-1">
            Close
          </Button>
          <Button onClick={handleVisitForm} className="sm:order-3">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Form
          </Button>
          <Button onClick={handleEditForm} variant="secondary" className="sm:order-2">
            Edit Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormLinkDialog;
