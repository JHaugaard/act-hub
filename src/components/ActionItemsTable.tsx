import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TASK_CATEGORIES } from '@/hooks/useData';
import type { ActionItem, TaskCategory, UpdateActionItemInput } from '@/types/actionItem';

interface ActionItemsTableProps {
  items: ActionItem[];
  loading: boolean;
  onToggleActive: (id: string) => Promise<boolean>;
  onUpdate: (id: string, updates: UpdateActionItemInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function ActionItemsTable({
  items,
  loading,
  onToggleActive,
  onUpdate,
  onDelete,
}: ActionItemsTableProps) {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNotesValue, setEditingNotesValue] = useState('');

  const handleNotesClick = (item: ActionItem) => {
    setEditingNotesId(item.id);
    setEditingNotesValue(item.notes || '');
  };

  const handleNotesBlur = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && editingNotesValue !== (item.notes || '')) {
      await onUpdate(id, { notes: editingNotesValue.trim() || null });
    }
    setEditingNotesId(null);
    setEditingNotesValue('');
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNotesBlur(id);
    } else if (e.key === 'Escape') {
      setEditingNotesId(null);
      setEditingNotesValue('');
    }
  };

  const handleTaskChange = async (id: string, task: TaskCategory) => {
    await onUpdate(id, { task });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          No action items yet. Create your first one to get started.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[480px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Active</TableHead>
            <TableHead className="w-[100px]">DB No</TableHead>
            <TableHead className="w-[150px]">Task</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
              <TableCell>
                <Switch
                  checked={item.is_active}
                  onCheckedChange={() => onToggleActive(item.id)}
                  aria-label={item.is_active ? 'Mark as complete' : 'Mark as active'}
                />
              </TableCell>
              <TableCell>
                {item.db_no ? (
                  <span className="font-medium">{item.db_no}</span>
                ) : (
                  <Badge variant="outline">General</Badge>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={item.task}
                  onValueChange={(value) => handleTaskChange(item.id, value as TaskCategory)}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {editingNotesId === item.id ? (
                  <Input
                    value={editingNotesValue}
                    onChange={(e) => setEditingNotesValue(e.target.value.slice(0, 100))}
                    onBlur={() => handleNotesBlur(item.id)}
                    onKeyDown={(e) => handleNotesKeyDown(e, item.id)}
                    maxLength={100}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleNotesClick(item)}
                    className="text-left w-full min-h-[32px] px-2 py-1 rounded hover:bg-muted transition-colors text-sm truncate"
                  >
                    {item.notes || <span className="text-muted-foreground italic">Click to add notes</span>}
                  </button>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(item.date_entered), 'MM/dd/yy')}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Action Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this action item? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
