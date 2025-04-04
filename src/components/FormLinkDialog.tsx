
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
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

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
  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    toast.success('Link copied to clipboard');
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleVisitForm = () => {
    // In a real implementation, this would open an actual form
    // For now, we'll just inform the user that this is a mock URL
    toast.info('This is a sample form URL. In a production environment, this would open your actual form.');
    
    // Open in a new tab and ensure the URL has the proper format
    const formattedUrl = formUrl.startsWith('http') ? formUrl : `https://${formUrl}`;
    window.open(formattedUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Form Created Successfully</DialogTitle>
          <DialogDescription>
            Your form "{formTitle}" has been created. You can share the link or embed it in your website.
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
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">This is a mock form URL for demonstration purposes.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-code">Embed Code</Label>
            <div className="flex items-stretch gap-2">
              <Textarea
                id="embed-code"
                value={embedCode}
                readOnly
                className="flex-1 h-24 font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={handleCopyEmbed} className="self-start">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleVisitForm}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormLinkDialog;
