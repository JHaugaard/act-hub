/**
 * PocketBase Action Items Hook
 * CRUD operations for action items using PocketBase API
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import { useToast } from '@/hooks/ui/use-toast';
import type { ActionItem, CreateActionItemInput, UpdateActionItemInput } from '@/types/actionItem';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

export function usePocketBaseActionItems() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActionItems = async () => {
    setLoading(true);
    try {
      // Fetch action items sorted by date_entered ascending (oldest first)
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/action_items/records?sort=date_entered&expand=file_id`,
        {
          headers: {
            'Authorization': `Bearer ${pb.authStore.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch action items: ${response.status}`);
      }

      const data = await response.json();
      const items: ActionItem[] = (data.items || []).map((record: any) => ({
        id: record.id,
        db_no: record.db_no || null,
        file_id: record.file_id || null,
        task: record.task,
        notes: record.notes || null,
        is_active: record.is_active ?? true,
        date_entered: record.date_entered,
        created_at: record.created,
        updated_at: record.updated,
      }));

      console.log(`✅ Loaded ${items.length} action items from PocketBase`);
      setActionItems(items);
    } catch (error) {
      console.error('Error fetching action items from PocketBase:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch action items. Please try again.',
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
      const record = await pb.collection('action_items').create({
        db_no: input.db_no || null,
        file_id: input.file_id || null,
        task: input.task,
        notes: input.notes || null,
        is_active: true,
        date_entered: now,
      });

      const newItem: ActionItem = {
        id: record.id,
        db_no: record.db_no || null,
        file_id: record.file_id || null,
        task: record.task,
        notes: record.notes || null,
        is_active: record.is_active ?? true,
        date_entered: record.date_entered,
        created_at: record.created,
        updated_at: record.updated,
      };

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
      await pb.collection('action_items').update(id, updates);

      // Optimistic update
      setActionItems(prev =>
        prev.map(item => (item.id === id ? { ...item, ...updates } : item))
      );
      return true;
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
      await pb.collection('action_items').delete(id);
      setActionItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: 'Action item deleted',
      });
      return true;
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
