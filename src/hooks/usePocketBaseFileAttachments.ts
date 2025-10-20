/**
 * PocketBase File Attachments Hook
 * Manages file attachments for proposals
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileAttachment {
  id: string;
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export function usePocketBaseFileAttachments(fileId?: string) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAttachments = async (id?: string) => {
    if (!id && !fileId) return;

    setLoading(true);
    try {
      const targetFileId = id || fileId;
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

  const uploadAttachment = async (
    targetFileId: string,
    file: File
  ): Promise<FileAttachment | null> => {
    try {
      const formData = new FormData();
      formData.append('file_id', targetFileId);
      formData.append('filename', file.name);
      formData.append('file_size', file.size.toString());

      // Note: PocketBase file field handling differs from Supabase
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

      toast({
        title: "Success",
        description: `File ${file.name} uploaded successfully.`,
      });

      return newAttachment;
    } catch (error) {
      console.error('Error uploading attachment to PocketBase:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
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
    uploadAttachment,
    deleteAttachment,
    refetch: fetchAttachments,
  };
}
