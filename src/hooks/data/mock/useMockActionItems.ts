import { useState, useEffect } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';
import { useToast } from '@/hooks/ui/use-toast';
import type { ActionItem, CreateActionItemInput, UpdateActionItemInput } from '@/types/actionItem';

export function useMockActionItems() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActionItems = async () => {
    setLoading(true);
    try {
      const items = mockStorage.getAll<ActionItem>(STORAGE_KEYS.ACTION_ITEMS);
      // Sort by date_entered ascending (oldest first)
      const sortedItems = [...items].sort((a, b) =>
        new Date(a.date_entered).getTime() - new Date(b.date_entered).getTime()
      );
      setActionItems(sortedItems);
    } catch (error) {
      console.error('Error fetching action items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load action items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, []);

  const createActionItem = async (input: CreateActionItemInput): Promise<ActionItem | null> => {
    try {
      const now = new Date().toISOString();
      const newItem = mockStorage.insert<ActionItem>(STORAGE_KEYS.ACTION_ITEMS, {
        db_no: input.db_no || null,
        file_id: input.file_id || null,
        task: input.task,
        notes: input.notes || null,
        is_active: true,
        date_entered: now,
        created_at: now,
        updated_at: now,
      } as ActionItem);
      await fetchActionItems();
      toast({
        title: 'Success',
        description: 'Action item created',
      });
      return newItem;
    } catch (error) {
      console.error('Error creating action item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create action item',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateActionItem = async (id: string, updates: UpdateActionItemInput): Promise<boolean> => {
    try {
      const updated = mockStorage.update<ActionItem>(STORAGE_KEYS.ACTION_ITEMS, id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
      if (updated) {
        // Optimistic update
        setActionItems(prev =>
          prev.map(item => (item.id === id ? { ...item, ...updates } : item))
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action item',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleActive = async (id: string): Promise<boolean> => {
    const item = actionItems.find(i => i.id === id);
    if (!item) return false;
    return updateActionItem(id, { is_active: !item.is_active });
  };

  const deleteActionItem = async (id: string): Promise<boolean> => {
    try {
      const success = mockStorage.delete(STORAGE_KEYS.ACTION_ITEMS, id);
      if (success) {
        setActionItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: 'Success',
          description: 'Action item deleted',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting action item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete action item',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    actionItems,
    loading,
    createActionItem,
    updateActionItem,
    toggleActive,
    deleteActionItem,
    refetch: fetchActionItems,
  };
}
