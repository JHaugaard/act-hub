import { useState, useEffect } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';
import { useToast } from '@/hooks/ui/use-toast';

interface FileAttachment {
  id: string;
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export function useMockFileAttachments(fileId: string | null) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { toast } = useToast();

  const fetchAttachments = async () => {
    if (!fileId) {
      setAttachments([]);
      return;
    }

    setLoading(true);
    try {
      const allAttachments = mockStorage.getAll<FileAttachment>(STORAGE_KEYS.FILE_ATTACHMENTS);
      const fileAttachments = allAttachments.filter(a => a.file_id === fileId);
      setAttachments(fileAttachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    if (!fileId) return false;

    try {
      // Convert file to base64 for localStorage storage (simplified for mock)
      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onload = () => {
          const base64Data = reader.result as string;

          const newAttachment: FileAttachment = {
            id: '',
            file_id: fileId,
            filename: file.name,
            file_path: base64Data, // Store base64 in path field
            file_size: file.size,
            uploaded_at: new Date().toISOString(),
          };

          mockStorage.insert(STORAGE_KEYS.FILE_ATTACHMENTS, newAttachment);

          toast({
            title: 'Success',
            description: 'File uploaded successfully',
          });

          fetchAttachments();
          resolve(true);
        };

        reader.onerror = () => {
          toast({
            title: 'Error',
            description: 'Failed to upload file',
            variant: 'destructive',
          });
          resolve(false);
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
      return false;
    }
  };

  const downloadFile = async (attachment: FileAttachment) => {
    try {
      // For mock, file_path contains base64 data
      const link = document.createElement('a');
      link.href = attachment.file_path;
      link.download = attachment.filename;
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const deleteFile = async (attachmentId: string): Promise<boolean> => {
    try {
      const success = mockStorage.delete(STORAGE_KEYS.FILE_ATTACHMENTS, attachmentId);

      if (success) {
        toast({
          title: 'Success',
          description: 'File deleted successfully',
        });
        await fetchAttachments();
      }

      return success;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [fileId]);

  return {
    attachments,
    loading,
    uploadProgress,
    uploadFile,
    downloadFile,
    deleteAttachment: deleteFile,
    refetch: fetchAttachments,
  };
}
