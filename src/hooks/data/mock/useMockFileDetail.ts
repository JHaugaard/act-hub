/**
 * Mock File Detail Hook
 * Provides file detail operations using localStorage mock storage
 */

import { useState, useEffect, useCallback } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';
import { useToast } from '@/hooks/ui/use-toast';

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

export function useMockFileDetail(fileId: string | undefined) {
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
      const fileData = mockStorage.getById(STORAGE_KEYS.FILES, fileId);

      if (!fileData) {
        setFile(null);
        setError(new Error('File not found'));
        setLoading(false);
        return;
      }

      // Get PI and Sponsor names
      const pi = mockStorage.getById(STORAGE_KEYS.PIS, fileData.pi_id);
      const sponsor = mockStorage.getById(STORAGE_KEYS.SPONSORS, fileData.sponsor_id);

      const formattedFile: FileDetailRecord = {
        id: fileData.id,
        db_no: fileData.db_no,
        status: fileData.status,
        date_received: fileData.date_received,
        date_status_change: fileData.date_status_change,
        notes: fileData.notes,
        external_link: fileData.external_link,
        cayuse: fileData.cayuse,
        to_set_up: fileData.to_set_up,
        created_at: fileData.created_at,
        updated_at: fileData.updated_at,
        pi_id: fileData.pi_id,
        sponsor_id: fileData.sponsor_id,
        pi_name: pi?.name || '',
        sponsor_name: sponsor?.name || '',
      };

      setFile(formattedFile);
    } catch (err) {
      console.error('Error fetching file from mock storage:', err);
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

  const updateFile = useCallback(async (updates: Record<string, any>) => {
    if (!fileId || !file) return false;

    try {
      mockStorage.update(STORAGE_KEYS.FILES, fileId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      await fetchFile();
      return true;
    } catch (err) {
      console.error('Error updating file in mock storage:', err);
      toast({
        title: "Error",
        description: "Failed to update file. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [fileId, file, fetchFile, toast]);

  const updatePI = useCallback(async (piId: string) => {
    const success = await updateFile({ pi_id: piId });
    if (success) {
      toast({
        title: "Success",
        description: "PI updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateSponsor = useCallback(async (sponsorId: string) => {
    const success = await updateFile({ sponsor_id: sponsorId });
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
      status: newStatus,
      date_status_change: new Date().toISOString(),
    });
    if (success) {
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateDBNo = useCallback(async (dbNo: string) => {
    const success = await updateFile({ db_no: dbNo });
    if (success) {
      toast({
        title: "Success",
        description: "DB No. updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateNotes = useCallback(async (notes: string) => {
    const success = await updateFile({ notes: notes || null });
    if (success) {
      toast({
        title: "Success",
        description: "Notes updated successfully.",
      });
    }
    return success;
  }, [updateFile, toast]);

  const updateDateReceived = useCallback(async (date: Date | undefined) => {
    const success = await updateFile({
      date_received: date?.toISOString().split('T')[0] || null,
    });
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
    });
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
      mockStorage.delete(STORAGE_KEYS.FILES, fileId);
      toast({
        title: "Success",
        description: "Proposal deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting file from mock storage:', err);
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
    updateDateReceived,
    updateStatusDate,
    deleteFile,
  };
}
