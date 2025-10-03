import { useState, useEffect } from 'react';
import { mockStorage, STORAGE_KEYS } from '@/lib/mockStorage';

export function useMockRelatedProposals(entityId: string | null, entityType: 'pi' | 'sponsor') {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entityId) {
      setProposals([]);
      return;
    }

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const files = mockStorage.getAll(STORAGE_KEYS.FILES);
        const pis = mockStorage.getAll(STORAGE_KEYS.PIS);
        const sponsors = mockStorage.getAll(STORAGE_KEYS.SPONSORS);

        const filtered = files.filter((file: any) => {
          if (entityType === 'pi') {
            return file.pi_id === entityId;
          } else {
            return file.sponsor_id === entityId;
          }
        });

        // Join with PI and Sponsor names
        const withNames = filtered.map((file: any) => {
          const pi = pis.find((p: any) => p.id === file.pi_id);
          const sponsor = sponsors.find((s: any) => s.id === file.sponsor_id);

          return {
            ...file,
            pi_name: pi?.name || 'Unknown',
            sponsor_name: sponsor?.name || 'Unknown',
          };
        });

        setProposals(withNames);
      } catch (error) {
        console.error('Error fetching related proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [entityId, entityType]);

  return { proposals, loading };
}
