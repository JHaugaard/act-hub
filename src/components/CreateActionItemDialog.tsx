import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { useFiles, useActionItems, TASK_CATEGORIES } from '@/hooks/useData';
import type { TaskCategory, CreateActionItemInput } from '@/types/actionItem';

interface CreateActionItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateActionItemDialog({ open, onOpenChange }: CreateActionItemDialogProps) {
  const { files } = useFiles();
  const { createActionItem } = useActionItems();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [task, setTask] = useState<TaskCategory | ''>('');
  const [notes, setNotes] = useState('');

  // Build autocomplete items from files (db_no as both id and name for display)
  const fileItems = files.map(file => ({
    id: file.id,
    name: file.db_no,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setIsSubmitting(true);
    try {
      const selectedFile = files.find(f => f.id === selectedFileId);
      const input: CreateActionItemInput = {
        db_no: selectedFile?.db_no || null,
        file_id: selectedFileId || null,
        task: task as TaskCategory,
        notes: notes.trim() || null,
      };

      const result = await createActionItem(input);
      if (result) {
        // Reset form and close
        setSelectedFileId('');
        setTask('');
        setNotes('');
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedFileId('');
      setTask('');
      setNotes('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Action Item</DialogTitle>
          <DialogDescription>
            Create a new action item. Leave DB No empty for a general task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="db_no">DB No (optional)</Label>
              <AutocompleteInput
                items={fileItems}
                value={selectedFileId}
                onSelect={setSelectedFileId}
                placeholder="Select DB No or leave empty for General"
              />
              {!selectedFileId && (
                <p className="text-xs text-muted-foreground">
                  Leave empty to create a "General" action item
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">Task *</Label>
              <Select value={task} onValueChange={(value) => setTask(value as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task type" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 100))}
                placeholder="Brief note (max 100 chars)"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/100
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !task}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
