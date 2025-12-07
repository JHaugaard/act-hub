/**
 * PocketBase File Attachments Hook
 * Manages file attachments for proposals
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { isValidPocketBaseId } from '@/lib/utils';

export interface FileAttachment {
  id: string;
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export function usePocketBaseFileAttachments(fileId?: string | null) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { toast } = useToast();

  const fetchAttachments = async (id?: string) => {
    if (!id && !fileId) return;

    setLoading(true);
    try {
      const targetFileId = id || fileId;

      // Validate ID format to prevent injection
      if (!targetFileId || !isValidPocketBaseId(targetFileId)) {
        console.warn('Invalid PocketBase ID format:', targetFileId);
        setAttachments([]);
        setLoading(false);
        return;
      }

      const records = await pb.collection('file_attachments').getFullList({
        filter: `file_id = "${targetFileId}"`,
        sort: '-uploaded_at',
      });

      const formattedAttachments: FileAttachment[] = records.map((record: any) => ({
        id: record.id,
        file_id: record.file_id,
        filename: record.filename,
        file_path: record.file_path,
        file_size: record.file_size,
        uploaded_at: record.uploaded_at,
      }));

      setAttachments(formattedAttachments);
    } catch (error) {
      console.error('Error fetching attachments from PocketBase:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    if (!fileId) return false;

    // Add to progress tracking
    setUploadProgress(prev => [...prev, {
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }]);

    try {
      const formData = new FormData();
      formData.append('file_id', fileId);
      formData.append('filename', file.name);
      formData.append('file_size', file.size.toString());

      // Update progress to 50% (simulated - PocketBase doesn't provide progress)
      setUploadProgress(prev => prev.map(p =>
        p.fileName === file.name ? { ...p, progress: 50 } : p
      ));

      // Note: PocketBase file field handling
      // File will be stored in pb_public directory by PocketBase
      const record = await pb.collection('file_attachments').create(formData);

      const newAttachment: FileAttachment = {
        id: record.id,
        file_id: record.file_id,
        filename: record.filename,
        file_path: record.file_path,
        file_size: record.file_size,
        uploaded_at: record.uploaded_at,
      };

      setAttachments(prev => [newAttachment, ...prev]);

      // Mark as success
      setUploadProgress(prev => prev.map(p =>
        p.fileName === file.name ? { ...p, progress: 100, status: 'success' } : p
      ));

      // Remove from progress after delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
      }, 2000);

      toast({
        title: "Success",
        description: `File ${file.name} uploaded successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error uploading attachment to PocketBase:', error);

      // Mark as error
      setUploadProgress(prev => prev.map(p =>
        p.fileName === file.name ? { ...p, status: 'error' } : p
      ));

      // Remove from progress after delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
      }, 3000);

      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const downloadFile = async (attachment: FileAttachment) => {
    try {
      // For PocketBase, we need to construct the file URL
      // This is a placeholder - actual implementation depends on how files are stored
      const url = attachment.file_path;

      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAttachment = async (attachmentId: string): Promise<boolean> => {
    try {
      await pb.collection('file_attachments').delete(attachmentId);

      setAttachments(prev => prev.filter(a => a.id !== attachmentId));

      toast({
        title: "Success",
        description: "Attachment deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting attachment from PocketBase:', error);
      toast({
        title: "Error",
        description: "Failed to delete attachment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (fileId) {
      fetchAttachments(fileId);
    }
  }, [fileId]);

  return {
    attachments,
    loading,
    uploadProgress,
    uploadFile,
    downloadFile,
    deleteAttachment,
    refetch: fetchAttachments,
  };
}
