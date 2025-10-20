/**
 * PocketBase Related Proposals Hook
 * Finds proposals related by PI or Sponsor
 */

import { useState, useEffect } from 'react';
import { pb } from '@/integrations/pocketbase/client';

export interface RelatedProposal {
  id: string;
  db_no: string;
  pi_name: string;
  sponsor_name: string;
  status: string;
  relationshipType: 'pi' | 'sponsor';
}

export function usePocketBaseRelatedProposals(fileId?: string) {
  const [relatedProposals, setRelatedProposals] = useState<RelatedProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRelatedProposals = async (id?: string) => {
    if (!id && !fileId) return;

    setLoading(true);
    try {
      const targetFileId = id || fileId;

      // Get the current file to find related PI and Sponsor
      const currentFile = await pb.collection('files').getOne(targetFileId, {
        expand: 'pi_id,sponsor_id',
      });

      const piId = currentFile.pi_id;
      const sponsorId = currentFile.sponsor_id;

      // Find other files with same PI
      const relatedByPI = await pb.collection('files').getFullList({
        filter: `pi_id = "${piId}" && id != "${targetFileId}"`,
        expand: 'pi_id,sponsor_id',
      });

      // Find other files with same Sponsor
      const relatedBySponsor = await pb.collection('files').getFullList({
        filter: `sponsor_id = "${sponsorId}" && id != "${targetFileId}"`,
        expand: 'pi_id,sponsor_id',
      });

      // Format results
      const related: RelatedProposal[] = [];

      relatedByPI.forEach((file: any) => {
        related.push({
          id: file.id,
          db_no: file.db_no,
          pi_name: file.expand?.pi_id?.name || '',
          sponsor_name: file.expand?.sponsor_id?.name || '',
          status: file.status,
          relationshipType: 'pi',
        });
      });

      relatedBySponsor.forEach((file: any) => {
        related.push({
          id: file.id,
          db_no: file.db_no,
          pi_name: file.expand?.pi_id?.name || '',
          sponsor_name: file.expand?.sponsor_id?.name || '',
          status: file.status,
          relationshipType: 'sponsor',
        });
      });

      setRelatedProposals(related);
    } catch (error) {
      console.error('Error fetching related proposals from PocketBase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      fetchRelatedProposals(fileId);
    }
  }, [fileId]);

  return { relatedProposals, loading, refetch: fetchRelatedProposals };
}
