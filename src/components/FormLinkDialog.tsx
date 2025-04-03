
import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ClipboardCopy, ExternalLink } from 'lucide-react';

interface FormLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  formUrl: string;
  embedCode?: string;
}

const FormLinkDialog: React.FC<FormLinkDialogProps> = ({
  isOpen,
  onClose,
  formTitle,
  formUrl,
  embedCode,
}) => {
  const linkInputRef = useRef<HTMLInputElement>(null);
  const embedInputRef = useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(message);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-center">Form Created Successfully!</DialogTitle>
          <DialogDescription className="text-center">
            "{formTitle}" is now ready to share with students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Form Link</label>
            <div className="flex space-x-2">
              <Input
                ref={linkInputRef}
                readOnly
                value={formUrl}
                className="font-mono text-sm"
              />
              <Button 
                type="button" 
                size="icon" 
                onClick={() => copyToClipboard(formUrl, 'Form link copied to clipboard!')}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {embedCode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Embed Code</label>
              <div className="flex space-x-2">
                <textarea
                  ref={embedInputRef}
                  readOnly
                  value={embedCode}
                  className="w-full h-24 font-mono text-sm p-2 border rounded-md resize-none"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  onClick={() => copyToClipboard(embedCode, 'Embed code copied to clipboard!')}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Close
          </Button>
          <Button 
            onClick={() => window.open(formUrl, '_blank')} 
            className="sm:flex-1"
          >
            Open Form <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormLinkDialog;
