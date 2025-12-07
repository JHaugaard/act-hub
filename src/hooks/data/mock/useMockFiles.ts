import { useState, useEffect } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';
import { useToast } from '@/hooks/ui/use-toast';
import type { FileRecord, SortField, SortDirection } from '@/hooks/useFiles';

export function useMockFiles() {
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
      const filesData = mockStorage.getAll(STORAGE_KEYS.FILES);
      const pisData = mockStorage.getAll(STORAGE_KEYS.PIS);
      const sponsorsData = mockStorage.getAll(STORAGE_KEYS.SPONSORS);

      // Join data (simulating database joins)
      const formattedFiles = filesData.map((file: any) => {
        const pi = pisData.find((p: any) => p.id === file.pi_id);
        const sponsor = sponsorsData.find((s: any) => s.id === file.sponsor_id);

        return {
          ...file,
          pi_name: pi?.name || 'Unknown',
          sponsor_name: sponsor?.name || 'Unknown',
        };
      });

      // Client-side sorting
      const sortedFiles = [...formattedFiles].sort((a: any, b: any) => {
        if (sortField === 'db_no') {
          const aNum = parseInt(a.db_no) || 0;
          const bNum = parseInt(b.db_no) || 0;
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';

        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      setFiles(sortedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [sortField, sortDirection]);

  // Client-side filtering
  const filteredFiles = files.filter(file => {
    // Status filter
    if (statusFilter !== 'All' && file.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        file.db_no.toLowerCase().includes(query) ||
        file.pi_name.toLowerCase().includes(query) ||
        file.sponsor_name.toLowerCase().includes(query) ||
        file.cayuse?.toLowerCase().includes(query) ||
        file.status.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate status counts
  const statusCounts = files.reduce((acc, file) => {
    acc[file.status] = (acc[file.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const updateFileStatus = async (fileId: string, newStatus: string) => {
    try {
      const updated = mockStorage.update(STORAGE_KEYS.FILES, fileId, {
        status: newStatus,
        date_status_change: new Date().toISOString(),
      });

      if (updated) {
        await fetchFiles();
        toast({
          title: 'Success',
          description: 'Status updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const success = mockStorage.delete(STORAGE_KEYS.FILES, fileId);
      if (success) {
        await fetchFiles();
        toast({
          title: 'Success',
          description: 'Proposal deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete proposal',
        variant: 'destructive',
      });
    }
  };

  return {
    files: filteredFiles,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    statusCounts,
    updateFileStatus,
    deleteFile,
    refetch: fetchFiles,
  };
}
