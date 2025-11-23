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

export function usePocketBaseRelatedProposals(entityId?: string | null, entityType: 'pi' | 'sponsor' = 'pi') {
  const [relatedProposals, setRelatedProposals] = useState<RelatedProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRelatedProposals = async (id?: string) => {
    if (!id && !entityId) return;

    setLoading(true);
    try {
      const targetId = id || entityId;
      const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

      // Query PocketBase REST API to find files with matching PI or Sponsor
      const filterField = entityType === 'pi' ? 'pi_id' : 'sponsor_id';
      let allRelated: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${POCKETBASE_URL}/api/collections/files/records?page=${page}&perPage=500&filter=${filterField}="${targetId}"&expand=pi_id,sponsor_id`,
          {
            headers: {
              'Authorization': `Bearer ${pb.authStore.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch related proposals: ${response.status}`);
        }

        const data = await response.json();
        allRelated = allRelated.concat(data.items || []);
        hasMore = page < data.totalPages;
        page++;
      }

      // Format results
      const related: RelatedProposal[] = allRelated.map((file: any) => ({
        id: file.id,
        db_no: file.db_no,
        pi_name: file.pi_name || file.expand?.pi_id?.name || '',
        sponsor_name: file.sponsor_name || file.expand?.sponsor_id?.name || '',
        status: file.status,
        relationshipType: entityType,
        date_received: file.date_received,
      })) as any;

      setRelatedProposals(related);
    } catch (error) {
      console.error('Error fetching related proposals from PocketBase:', error);
      setRelatedProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchRelatedProposals(entityId);
    } else {
      setRelatedProposals([]);
    }
  }, [entityId, entityType]);

  return { proposals: relatedProposals, loading, refetch: fetchRelatedProposals };
}
