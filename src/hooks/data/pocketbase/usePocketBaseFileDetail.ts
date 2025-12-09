/**
 * PocketBase File Detail Hook
 * Provides file detail operations using PocketBase API
 */

import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import { useToast } from '@/hooks/ui/use-toast';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

export interface FileDetailRecord {
  id: string;
  db_no: string;
  status: 'In' | 'Pending' | 'Pending Signature' | 'Pending Signatures' | 'Process' | 'Done' | 'On Hold' | 'Withdrawn';
  date_received: string | null;
  date_status_change: string | null;
  notes: string | null;
  external_link: string | null;
  cayuse: string | null;
  to_set_up: string | null;
  created_at: string;
  updated_at: string;
  pi_id: string;
  sponsor_id: string;
  pi_name: string;
  sponsor_name: string;
}

export function usePocketBaseFileDetail(fileId: string | undefined) {
  const [file, setFile] = useState<FileDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchFile = useCallback(async () => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/files/records/${fileId}?expand=pi_id,sponsor_id`,
        {
          headers: {
            'Authorization': `Bearer ${pb.authStore.token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setFile(null);
          setError(new Error('File not found'));
          return;
        }
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const record = await response.json();

      const formattedFile: FileDetailRecord = {
        id: record.id,
        db_no: record.db_no,
        status: record.status,
        date_received: record.date_received,
        date_status_change: record.date_status_change,
        notes: record.notes,
        external_link: record.external_link,
        cayuse: record.cayuse,
        to_set_up: record.to_set_up,
        created_at: record.created,
        updated_at: record.updated,
        pi_id: record.pi_id,
        sponsor_id: record.sponsor_id,
        pi_name: record.expand?.pi_id?.name || '',
        sponsor_name: record.expand?.sponsor_id?.name || '',
      };

      setFile(formattedFile);
    } catch (err) {
      console.error('Error fetching file from PocketBase:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch file'));
      toast({
        title: "Error",
        description: "Failed to fetch file details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fileId, toast]);

  const updateFile = useCallback(async (updates: Partial<FileDetailRecord>) => {
    if (!fileId || !file) return false;

    try {
      await pb.collection('files').update(fileId, {
        ...updates,
        updated: new Date().toISOString(),
      });

      // Refetch to get updated data with expanded relations
      await fetchFile();
      return true;
    } catch (err) {
      console.error('Error updating file in PocketBase:', err);
      toast({
        title: "Error",
        description: "Failed to update file. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [fileId, file, fetchFile, toast]);

  const updatePI = useCallback(async (piId: string) => {
    const success = await updateFile({ pi_id: piId } as any);
    if (success) {
      toast({
        title: "Success",
        description: "PI updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateSponsor = useCallback(async (sponsorId: string) => {
    const success = await updateFile({ sponsor_id: sponsorId } as any);
    if (success) {
      toast({
        title: "Success",
        description: "Sponsor updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateStatus = useCallback(async (newStatus: string) => {
    const success = await updateFile({
      status: newStatus as any,
      date_status_change: new Date().toISOString(),
    } as any);
    if (success) {
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateDBNo = useCallback(async (dbNo: string) => {
    const success = await updateFile({ db_no: dbNo } as any);
    if (success) {
      toast({
        title: "Success",
        description: "DB No. updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateNotes = useCallback(async (notes: string) => {
    const success = await updateFile({ notes: notes || null } as any);
    if (success) {
      toast({
        title: "Success",
        description: "Notes updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateCayuse = useCallback(async (cayuse: string) => {
    const success = await updateFile({ cayuse: cayuse || null } as any);
    if (success) {
      toast({
        title: "Success",
        description: "Cayuse updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateDateReceived = useCallback(async (date: Date | undefined) => {
    const success = await updateFile({
      date_received: date?.toISOString().split('T')[0] || null,
    } as any);
    if (success) {
      toast({
        title: "Success",
        description: "Date received updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateStatusDate = useCallback(async (date: Date | undefined) => {
    const success = await updateFile({
      date_status_change: date?.toISOString() || null,
    } as any);
    if (success) {
      toast({
        title: "Success",
        description: "Status date updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const deleteFile = useCallback(async () => {
    if (!fileId) return false;

    try {
      await pb.collection('files').delete(fileId);
      toast({
        title: "Success",
        description: "Proposal deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting file from PocketBase:', err);
      toast({
        title: "Error",
        description: "Failed to delete proposal. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [fileId, toast]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  return {
    file,
    loading,
    error,
    refetch: fetchFile,
    updatePI,
    updateSponsor,
    updateStatus,
    updateDBNo,
    updateNotes,
    updateCayuse,
    updateDateReceived,
    updateStatusDate,
    deleteFile,
  };
}
