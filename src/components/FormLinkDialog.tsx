
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Copy, ExternalLink } from 'lucide-react';

interface FormLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  formUrl: string;
}

const FormLinkDialog: React.FC<FormLinkDialogProps> = ({
  isOpen,
  onClose,
  formTitle,
  formUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy to clipboard');
      }
    );
  };

  const openFormInNewTab = () => {
    window.open(formUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Form Created Successfully</DialogTitle>
          <DialogDescription>
            Your form "{formTitle}" has been created. You can share the link below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="form-url">Form URL</Label>
            <div className="flex gap-2">
              <Input
                id="form-url"
                value={formUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(formUrl)}
                className="h-10 w-10"
                title="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={openFormInNewTab}
                className="h-10 w-10" 
                title="Open Form"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormLinkDialog;
