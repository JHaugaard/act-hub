/**
 * Supabase File Detail Hook
 * Provides file detail operations using Supabase API
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export function useSupabaseFileDetail(fileId: string | undefined) {
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
      const { data, error: fetchError } = await supabase
        .from('files')
        .select(`
          *,
          pis!inner(name),
          sponsors!inner(name)
        `)
        .eq('id', fileId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setFile(null);
        setError(new Error('File not found'));
        return;
      }

      const formattedFile: FileDetailRecord = {
        id: data.id,
        db_no: data.db_no,
        status: data.status,
        date_received: data.date_received,
        date_status_change: data.date_status_change,
        notes: data.notes,
        external_link: data.external_link,
        cayuse: data.cayuse,
        to_set_up: data.to_set_up,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pi_id: data.pi_id,
        sponsor_id: data.sponsor_id,
        pi_name: data.pis.name,
        sponsor_name: data.sponsors.name,
      };

      setFile(formattedFile);
    } catch (err) {
      console.error('Error fetching file from Supabase:', err);
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
      const { error: updateError } = await supabase
        .from('files')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId);

      if (updateError) throw updateError;

      // Refetch to get updated data with joined relations
      await fetchFile();
      return true;
    } catch (err) {
      console.error('Error updating file in Supabase:', err);
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
      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Proposal deleted successfully.",
      });
      return true;
    } catch (err) {
      console.error('Error deleting file from Supabase:', err);
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
