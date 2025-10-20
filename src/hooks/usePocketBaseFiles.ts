/**
 * PocketBase Files Hook
 * Mirrors the Supabase useFiles hook but uses PocketBase API
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileRecord {
  id: string;
  db_no: string;
  status: 'In' | 'Pending' | 'Pending Signatures' | 'Process' | 'Done' | 'On Hold' | 'Withdrawn';
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

export type SortField = 'db_no' | 'pi_name' | 'sponsor_name' | 'status' | 'date_received' | 'date_status_change';
export type SortDirection = 'asc' | 'desc';

export function usePocketBaseFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date_received');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // PocketBase query with expand to get related PI and Sponsor data
      const records = await pb.collection('files').getFullList({
        sort: '-created_at',
        expand: 'pi_id,sponsor_id',
      });

      // Transform PocketBase records to match FileRecord interface
      const formattedFiles: FileRecord[] = records.map((record: any) => ({
        id: record.id,
        db_no: record.db_no,
        status: record.status,
        date_received: record.date_received,
        date_status_change: record.date_status_change,
        notes: record.notes,
        external_link: record.external_link,
        cayuse: record.cayuse,
        to_set_up: record.to_set_up,
        created_at: record.created_at,
        updated_at: record.updated_at,
        pi_id: record.pi_id,
        sponsor_id: record.sponsor_id,
        pi_name: record.expand?.pi_id?.name || '',
        sponsor_name: record.expand?.sponsor_id?.name || '',
      }));

      console.log(`✅ Loaded ${formattedFiles.length} total proposals from PocketBase`);
      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files from PocketBase:', error);
      toast({
        title: "Error",
        description: "Failed to fetch proposals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFileStatus = async (
    fileId: string,
    newStatus: 'In' | 'Pending' | 'Pending Signatures' | 'Process' | 'Done' | 'On Hold' | 'Withdrawn'
  ) => {
    try {
      await pb.collection('files').update(fileId, {
        status: newStatus,
        date_status_change: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Update local state
      setFiles(prev =>
        prev.map(file =>
          file.id === fileId
            ? { ...file, status: newStatus, date_status_change: new Date().toISOString() }
            : file
        )
      );

      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status in PocketBase:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesStatus = statusFilter === 'All' || file.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      file.db_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.pi_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Apply client-side sorting
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle numeric sorting for db_no
    if (sortField === 'db_no') {
      const getNumericValue = (dbNo: string) => {
        const match = dbNo.match(/^\d{1,4}/);
        return match ? parseInt(match[0], 10) : 0;
      };
      aValue = getNumericValue(a.db_no);
      bValue = getNumericValue(b.db_no);
    }

    // Handle null values
    if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

    // Standard comparison
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const statusCounts = files.reduce(
    (acc, file) => {
      acc[file.status] = (acc[file.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files: sortedFiles,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    statusCounts,
    updateFileStatus,
    refetch: fetchFiles,
  };
}
